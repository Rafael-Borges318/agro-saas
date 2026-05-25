import { z } from 'zod';
import { ReproducaoStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { ForbiddenError, NotFoundError } from '../../utils/AppError';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

/* ─── Schemas ────────────────────────────────────────────────────────────── */

export const createReproducaoSchema = z.object({
  dataCobertura:     z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Data de cobertura inválida' })
                       .transform((d) => new Date(d)),
  dataPrevistaParto: z.string().optional()
                       .refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Data prevista inválida' })
                       .transform((d) => (d ? new Date(d) : undefined)),
  dataPartoReal:     z.string().optional()
                       .refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Data parto inválida' })
                       .transform((d) => (d ? new Date(d) : undefined)),
  parceiroId:        z.string().uuid().optional(),
  quantidadeFilhos:  z.number().int().min(0).optional(),
  observacoes:       z.string().trim().max(1000).optional(),
  status:            z.nativeEnum(ReproducaoStatus).default('PRENHA'),
});

export const updateReproducaoSchema = createReproducaoSchema.partial();

export type CreateReproducaoDTO = z.infer<typeof createReproducaoSchema>;
export type UpdateReproducaoDTO = z.infer<typeof updateReproducaoSchema>;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

async function verifyAccess(userId: string, isAdmin: boolean, animalId: string) {
  const animal = await prisma.animal.findFirst({
    where: isAdmin
      ? { id: animalId }
      : { id: animalId, propriedade: { produtor: { userId } } },
    select: { id: true, sexo: true },
  });
  if (!animal) throw new NotFoundError('Animal');
  return animal;
}

/* ─── Service ────────────────────────────────────────────────────────────── */

export const reproducaoService = {
  async list(userId: string, userRole: string, animalId: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAccess(userId, isAdmin, animalId);
    return prisma.reproducao.findMany({
      where: { animalId },
      orderBy: { dataCobertura: 'desc' },
      include: {
        parceiro: { select: { id: true, nome: true, numeroIdentificacao: true, especie: true } },
      },
    });
  },

  async create(userId: string, userRole: string, animalId: string, data: CreateReproducaoDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const animal = await verifyAccess(userId, isAdmin, animalId);
    if (animal.sexo !== 'FEMEA') throw new ForbiddenError('Apenas fêmeas podem ter registros de reprodução');
    return prisma.reproducao.create({ data: { animalId, ...data } });
  },

  async update(userId: string, userRole: string, animalId: string, repId: string, data: UpdateReproducaoDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAccess(userId, isAdmin, animalId);
    const r = await prisma.reproducao.findFirst({ where: { id: repId, animalId } });
    if (!r) throw new NotFoundError('Registro de reprodução');
    return prisma.reproducao.update({ where: { id: repId }, data });
  },

  async remove(userId: string, userRole: string, animalId: string, repId: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAccess(userId, isAdmin, animalId);
    const r = await prisma.reproducao.findFirst({ where: { id: repId, animalId } });
    if (!r) throw new NotFoundError('Registro de reprodução');
    await prisma.reproducao.delete({ where: { id: repId } });
  },

  async upcoming(userId: string, userRole: string, days = 14) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const until = new Date();
    until.setDate(until.getDate() + days);
    const where = isAdmin
      ? { dataPrevistaParto: { lte: until, gte: new Date() }, status: 'PRENHA' as ReproducaoStatus }
      : { dataPrevistaParto: { lte: until, gte: new Date() }, status: 'PRENHA' as ReproducaoStatus, animal: { propriedade: { produtor: { userId } } } };
    return prisma.reproducao.findMany({
      where,
      orderBy: { dataPrevistaParto: 'asc' },
      include: { animal: { select: { id: true, nome: true, numeroIdentificacao: true, especie: true } } },
    });
  },
};
