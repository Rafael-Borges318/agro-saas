import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';

export const marketplaceService = {
  list: () => prisma.marketplaceProduct.findMany({ where: { status: 'ATIVO' }, orderBy: { createdAt: 'desc' } }),

  async findById(id: string) {
    const p = await prisma.marketplaceProduct.findUnique({ where: { id } });
    if (!p) throw new NotFoundError('Produto');
    return p;
  },

  create: (data: any) => prisma.marketplaceProduct.create({ data }),

  async update(id: string, data: any) {
    const p = await prisma.marketplaceProduct.findUnique({ where: { id } });
    if (!p) throw new NotFoundError('Produto');
    return prisma.marketplaceProduct.update({ where: { id }, data });
  },

  async remove(id: string) {
    const p = await prisma.marketplaceProduct.findUnique({ where: { id } });
    if (!p) throw new NotFoundError('Produto');
    return prisma.marketplaceProduct.update({ where: { id }, data: { status: 'REMOVIDO' } });
  },
};
