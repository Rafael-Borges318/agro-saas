import { prisma } from '../../config/db';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  onboardingCompleted: true,
} as const;

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
      select: USER_SELECT,
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  },
};
