import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../lib/bcrypt';
import { signToken } from '../../lib/jwt';
import { AppError, ConflictError, UnauthorizedError } from '../../utils/AppError';
import { addDays } from '../../utils/date';
import { prisma } from '../../config/db';
import type { LoginDTO, RegisterDTO, AuthResponse } from './auth.types';

export const authService = {
  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existing = await authRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('Email já cadastrado');

    const passwordHash = await hashPassword(dto.password);
    const user = await authRepository.create({ ...dto, passwordHash });

    // Auto-create a 30-day trial on the free plan (best-effort)
    try {
      const freePlan = await prisma.plan.findFirst({
        where: { preco: 0, status: 'ATIVO' },
      });
      if (freePlan) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: freePlan.id,
            status: 'TRIAL',
            dataFim: addDays(new Date(), 30),
          },
        });
      }
    } catch {
      // Non-fatal — user can select a plan later
    }

    const token = signToken({ sub: user.id, role: user.role });
    return { token, user };
  },

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const userRecord = await authRepository.findByEmail(dto.email);
    if (!userRecord) throw new UnauthorizedError('Credenciais inválidas');

    const valid = await comparePassword(dto.password, userRecord.passwordHash);
    if (!valid) throw new UnauthorizedError('Credenciais inválidas');

    if (!userRecord.isActive) {
      throw new AppError('Conta desativada. Entre em contato com o suporte.', 403);
    }

    const token = signToken({ sub: userRecord.id, role: userRecord.role });
    return {
      token,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        onboardingCompleted: userRecord.onboardingCompleted,
      },
    };
  },
};
