import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';

export const notificacoesService = {
  list: (userId: string) =>
    prisma.notificacao.findMany({ where: { userId }, orderBy: { criadoEm: 'desc' }, take: 50 }),

  async markAsRead(id: string) {
    const n = await prisma.notificacao.findUnique({ where: { id } });
    if (!n) throw new NotFoundError('Notificação');
    return prisma.notificacao.update({ where: { id }, data: { lida: true } });
  },

  async remove(id: string) {
    const n = await prisma.notificacao.findUnique({ where: { id } });
    if (!n) throw new NotFoundError('Notificação');
    await prisma.notificacao.delete({ where: { id } });
  },
};
