import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { authRepository } from './auth.repository';
import { UnauthorizedError } from '../../utils/AppError';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import type { LoginDTO, RegisterDTO } from './auth.types';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body as RegisterDTO);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body as LoginDTO);
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authRepository.findById(req.userId!);
      if (!user) throw new UnauthorizedError('Usuário não encontrado');
      res.json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  },
};
