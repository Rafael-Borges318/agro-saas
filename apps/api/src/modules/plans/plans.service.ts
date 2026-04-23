import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';

export const plansService = {
  list: () => prisma.plan.findMany({ where: { status: 'ATIVO' }, orderBy: { preco: 'asc' } }),

  async findById(id: string) {
    const p = await prisma.plan.findUnique({ where: { id } });
    if (!p) throw new NotFoundError('Plano');
    return p;
  },

  create: (data: any) => prisma.plan.create({ data }),

  async update(id: string, data: any) {
    const p = await prisma.plan.findUnique({ where: { id } });
    if (!p) throw new NotFoundError('Plano');
    return prisma.plan.update({ where: { id }, data });
  },
};
