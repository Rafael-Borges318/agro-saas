import { z } from 'zod';
import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

/* ─── Schemas ────────────────────────────────────────────────────────────── */

export const createVacinaSchema = z.object({
  nomeVacina:    z.string().trim().min(1).max(100),
  dataAplicacao: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Data inválida' })
                   .transform((d) => new Date(d)),
  proximaDose:   z.string().optional()
                   .refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Próxima dose inválida' })
                   .transform((d) => (d ? new Date(d) : undefined)),
  observacoes:   z.string().trim().max(500).optional(),
});

export const updateVacinaSchema = createVacinaSchema.partial();

export type CreateVacinaDTO = z.infer<typeof createVacinaSchema>;
export type UpdateVacinaDTO = z.infer<typeof updateVacinaSchema>;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

async function verifyAccess(userId: string, isAdmin: boolean, animalId: string) {
  const animal = await prisma.animal.findFirst({
    where: isAdmin
      ? { id: animalId }
      : { id: animalId, propriedade: { produtor: { userId } } },
    select: { id: true },
  });
  if (!animal) throw new NotFoundError('Animal');
  return animal;
}

async function verifyVacinaAccess(userId: string, isAdmin: boolean, animalId: string, vacId: string) {
  await verifyAccess(userId, isAdmin, animalId);
  const v = await prisma.vacina.findFirst({ where: { id: vacId, animalId } });
  if (!v) throw new NotFoundError('Vacina');
  return v;
}

/* ─── Service ────────────────────────────────────────────────────────────── */

export const vacinasService = {
  async list(userId: string, userRole: string, animalId: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAccess(userId, isAdmin, animalId);
    return prisma.vacina.findMany({
      where: { animalId },
      orderBy: { dataAplicacao: 'desc' },
    });
  },

  async create(userId: string, userRole: string, animalId: string, data: CreateVacinaDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAccess(userId, isAdmin, animalId);
    return prisma.vacina.create({ data: { animalId, ...data } });
  },

  async update(userId: string, userRole: string, animalId: string, vacId: string, data: UpdateVacinaDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyVacinaAccess(userId, isAdmin, animalId, vacId);
    return prisma.vacina.update({ where: { id: vacId }, data });
  },

  async remove(userId: string, userRole: string, animalId: string, vacId: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyVacinaAccess(userId, isAdmin, animalId, vacId);
    await prisma.vacina.delete({ where: { id: vacId } });
  },

  async upcoming(userId: string, userRole: string, days = 30) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const until = new Date();
    until.setDate(until.getDate() + days);
    const where = isAdmin
      ? { proximaDose: { lte: until, gte: new Date() } }
      : { proximaDose: { lte: until, gte: new Date() }, animal: { propriedade: { produtor: { userId } } } };
    return prisma.vacina.findMany({
      where,
      orderBy: { proximaDose: 'asc' },
      include: { animal: { select: { id: true, nome: true, numeroIdentificacao: true, especie: true } } },
    });
  },
};
