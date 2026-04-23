import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';
import { buildPaginationMeta } from '../../utils/formatters';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../utils/constants';

export const usersService = {
  async list(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return { data: users, meta: buildPaginationMeta(total, page, limit) };
  },

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('Usuário');
    return user;
  },

  async update(id: string, data: { name?: string; avatarUrl?: string }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('Usuário');
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
  },

  async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('Usuário');
    await prisma.user.delete({ where: { id } });
  },
};
