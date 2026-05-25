import { z } from 'zod';
import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

/* ─── Schemas ────────────────────────────────────────────────────────────── */

export const createPesagemSchema = z.object({
  pesoKg:       z.number().positive('Peso deve ser positivo'),
  dataPesagem:  z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Data inválida' })
                  .transform((d) => new Date(d)),
  observacoes:  z.string().trim().max(500).optional(),
  atualizarPeso: z.boolean().default(false),
});

export type CreatePesagemDTO = z.infer<typeof createPesagemSchema>;

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

/* ─── Service ────────────────────────────────────────────────────────────── */

export const pesagensService = {
  async list(userId: string, userRole: string, animalId: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAccess(userId, isAdmin, animalId);
    return prisma.pesagem.findMany({
      where: { animalId },
      orderBy: { dataPesagem: 'asc' },
    });
  },

  async create(userId: string, userRole: string, animalId: string, data: CreatePesagemDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAccess(userId, isAdmin, animalId);

    const { atualizarPeso, ...pesagemData } = data;
    const pesagem = await prisma.pesagem.create({ data: { animalId, ...pesagemData } });

    if (atualizarPeso) {
      await prisma.animal.update({ where: { id: animalId }, data: { pesoKg: data.pesoKg } });
    }

    return pesagem;
  },

  async remove(userId: string, userRole: string, animalId: string, pesId: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    await verifyAccess(userId, isAdmin, animalId);
    const p = await prisma.pesagem.findFirst({ where: { id: pesId, animalId } });
    if (!p) throw new NotFoundError('Pesagem');
    await prisma.pesagem.delete({ where: { id: pesId } });
  },
};
