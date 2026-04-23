import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
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

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: { userId: (req as any).userId } });
    } catch (err) {
      next(err);
    }
  },
};
