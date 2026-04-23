import { prisma } from '../../config/db';

export const adminService = {
  async stats() {
    const [users, produtores, animais, culturas] = await Promise.all([
      prisma.user.count(),
      prisma.produtor.count(),
      prisma.animal.count({ where: { status: 'ATIVO' } }),
      prisma.cultura.count(),
    ]);
    return { users, produtores, animais, culturas };
  },

  listUsers: () =>
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } }),

  async toggleUserStatus(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('Usuário não encontrado');
    return prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  },
};
