import { prisma } from '../../config/db';

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      },
      select: { id: true, name: true, email: true, role: true },
    });
  },
};
