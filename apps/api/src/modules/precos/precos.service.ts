import { prisma } from '../../config/db';

export const precosService = {
  list() {
    return prisma.precoAgricola.findMany({ orderBy: { data: 'desc' }, take: 100 });
  },

  getByProduto(produto: string) {
    return prisma.precoAgricola.findMany({
      where: { produto: { contains: produto, mode: 'insensitive' } },
      orderBy: { data: 'desc' },
      take: 30,
    });
  },
};
