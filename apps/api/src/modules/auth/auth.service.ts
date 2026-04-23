import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../lib/bcrypt';
import { signToken } from '../../lib/jwt';
import { AppError, ConflictError, UnauthorizedError } from '../../utils/AppError';
import type { LoginDTO, RegisterDTO, AuthResponse } from './auth.types';

export const authService = {
  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existing = await authRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('Email já cadastrado');

    const passwordHash = await hashPassword(dto.password);
    const user = await authRepository.create({ ...dto, passwordHash });

    const token = signToken({ sub: user.id, role: user.role });
    return { token, user };
  },

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await authRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedError('Credenciais inválidas');

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Credenciais inválidas');

    if (!user.isActive) throw new AppError('Conta desativada. Entre em contato com o suporte.', 403);

    const token = signToken({ sub: user.id, role: user.role });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },
};
