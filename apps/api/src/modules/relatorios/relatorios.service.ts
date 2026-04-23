import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';

export const relatoriosService = {
  list: (propriedadeId: string) =>
    prisma.relatorio.findMany({ where: { propriedadeId }, orderBy: { criadoEm: 'desc' } }),

  async gerar(propriedadeId: string, tipo: string, titulo: string) {
    return prisma.relatorio.create({
      data: { propriedadeId, tipo, titulo, dados: { geradoEm: new Date() } },
    });
  },

  async remove(id: string) {
    const r = await prisma.relatorio.findUnique({ where: { id } });
    if (!r) throw new NotFoundError('Relatório');
    await prisma.relatorio.delete({ where: { id } });
  },
};
