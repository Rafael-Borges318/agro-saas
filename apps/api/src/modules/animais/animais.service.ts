import { z } from 'zod';
import { Prisma, AnimalEspecie, AnimalSexo, AnimalStatus, AnimalEventoTipo } from '@prisma/client';
import { prisma } from '../../config/db';
import { ForbiddenError, NotFoundError } from '../../utils/AppError';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

/* ─── Zod schemas ────────────────────────────────────────────────────────── */

export const createAnimalSchema = z.object({
  propriedadeId:       z.string().uuid('propriedadeId inválido'),
  especie:             z.nativeEnum(AnimalEspecie),
  sexo:                z.nativeEnum(AnimalSexo),
  status:              z.nativeEnum(AnimalStatus).default('ATIVO'),
  nome:                z.string().trim().max(100).optional(),
  numeroIdentificacao: z.string().trim().max(50).optional(),
  raca:                z.string().trim().max(80).optional(),
  dataNascimento: z
    .string()
    .optional()
    .refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Data inválida' })
    .transform((d) => (d ? new Date(d) : undefined)),
  pesoKg:      z.number().positive('Peso deve ser positivo').optional(),
  observacoes: z.string().trim().max(1000).optional(),
});

export const updateAnimalSchema = createAnimalSchema.partial().omit({ propriedadeId: true });

export const createEventoSchema = z.object({
  tipo:      z.nativeEnum(AnimalEventoTipo),
  descricao: z.string().trim().min(1, 'Descrição obrigatória').max(500),
  data: z
    .string({ required_error: 'Data é obrigatória' })
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Data inválida' })
    .transform((d) => new Date(d)),
  valor: z.number().positive().optional(),
});

export const listAnimaisSchema = z.object({
  especie:  z.nativeEnum(AnimalEspecie).optional(),
  status:   z.nativeEnum(AnimalStatus).optional(),
  search:   z.string().trim().optional(),
  orderBy:  z.enum(['nome', 'pesoKg', 'dataNascimento', 'createdAt']).default('createdAt'),
  order:    z.enum(['asc', 'desc']).default('desc'),
});

export type CreateAnimalDTO = z.infer<typeof createAnimalSchema>;
export type UpdateAnimalDTO = z.infer<typeof updateAnimalSchema>;
export type CreateEventoDTO = z.infer<typeof createEventoSchema>;
export type ListAnimaisDTO  = z.infer<typeof listAnimaisSchema>;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function propScope(userId: string): Prisma.PropriedadeWhereInput {
  return { produtor: { userId } };
}

async function verifyAnimalAccess(userId: string, isAdmin: boolean, animalId: string) {
  const a = await prisma.animal.findFirst({
    where: isAdmin ? { id: animalId } : { id: animalId, propriedade: propScope(userId) },
    select: { id: true, propriedadeId: true },
  });
  if (!a) throw new NotFoundError('Animal');
  return a;
}

async function verifyPropriedadeAccess(userId: string, isAdmin: boolean, propriedadeId: string) {
  const prop = await prisma.propriedade.findFirst({
    where: isAdmin ? { id: propriedadeId } : { id: propriedadeId, produtor: { userId } },
    select: { id: true },
  });
  if (!prop) throw new ForbiddenError('Propriedade não encontrada ou acesso negado');
}

/* ─── Service ────────────────────────────────────────────────────────────── */

export const animaisService = {
  async list(userId: string, userRole: string, filters: ListAnimaisDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const where: Prisma.AnimalWhereInput = {
      propriedade: isAdmin ? undefined : propScope(userId),
      especie:     filters.especie,
      status:      filters.status,
      ...(filters.search
        ? {
            OR: [
              { nome:                { contains: filters.search, mode: 'insensitive' } },
              { numeroIdentificacao: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    return prisma.animal.findMany({ where, orderBy: { [filters.orderBy]: filters.order } });
  },

  async findById(userId: string, userRole: string, id: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const a = await prisma.animal.findFirst({
      where: isAdmin ? { id } : { id, propriedade: propScope(userId) },
      include: { eventos: { orderBy: { data: 'desc' }, take: 50 } },
    });
    if (!a) throw new NotFoundError('Animal');
    return a;
  },

  async create(userId: string, userRole: string, data: CreateAnimalDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyPropriedadeAccess(userId, isAdmin, data.propriedadeId);
    return prisma.animal.create({ data });
  },

  async update(userId: string, userRole: string, id: string, data: UpdateAnimalDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAnimalAccess(userId, isAdmin, id);
    return prisma.animal.update({ where: { id }, data });
  },

  async remove(userId: string, userRole: string, id: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAnimalAccess(userId, isAdmin, id);
    await prisma.animal.delete({ where: { id } });
  },

  async stats(userId: string, userRole: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const animais = await prisma.animal.findMany({
      where: { propriedade: isAdmin ? undefined : propScope(userId) },
      select: { especie: true, status: true, pesoKg: true },
    });
    const total  = animais.length;
    const ativos = animais.filter((a) => a.status === 'ATIVO').length;
    const porEspecie: Record<string, number> = {};
    for (const a of animais) porEspecie[a.especie] = (porEspecie[a.especie] ?? 0) + 1;
    const comPeso = animais.filter((a) => a.pesoKg != null && a.status === 'ATIVO');
    const pesoMedio = comPeso.length > 0
      ? comPeso.reduce((s, a) => s + (a.pesoKg ?? 0), 0) / comPeso.length
      : null;
    return { total, ativos, porEspecie, pesoMedio };
  },

  async listEventos(userId: string, userRole: string, animalId: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAnimalAccess(userId, isAdmin, animalId);
    return prisma.animalEvento.findMany({ where: { animalId }, orderBy: { data: 'desc' } });
  },

  async createEvento(userId: string, userRole: string, animalId: string, data: CreateEventoDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const animal = await verifyAnimalAccess(userId, isAdmin, animalId);

    const evento = await prisma.animalEvento.create({ data: { animalId, ...data } });

    if (data.tipo === 'PESAGEM' && data.valor != null) {
      await prisma.animal.update({ where: { id: animalId }, data: { pesoKg: data.valor } });
    }

    if (data.tipo === 'VENDA') {
      await prisma.animal.update({ where: { id: animalId }, data: { status: 'VENDIDO' } });
      if (data.valor != null && data.valor > 0) {
        await prisma.receita.create({
          data: {
            propriedadeId: animal.propriedadeId,
            descricao:     data.descricao,
            valor:         data.valor,
            data:          data.data,
            categoria:     'VENDA_ANIMAL',
          },
        });
      }
    }

    return evento;
  },
};
