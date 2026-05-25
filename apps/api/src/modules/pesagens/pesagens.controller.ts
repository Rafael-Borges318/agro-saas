import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../utils/AppError';
import { pesagensService, createPesagemSchema } from './pesagens.service';

function ctx(req: AuthenticatedRequest) {
  if (!req.userId) throw new UnauthorizedError();
  return { userId: req.userId, userRole: req.userRole ?? 'PRODUTOR' };
}

export const pesagensController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      res.json({ status: 'success', data: await pesagensService.list(userId, userRole, req.params.id) });
    } catch (e) { next(e); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = createPesagemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.status(201).json({ status: 'success', data: await pesagensService.create(userId, userRole, req.params.id, parsed.data) });
    } catch (e) { next(e); }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      await pesagensService.remove(userId, userRole, req.params.id, req.params.pesId);
      res.status(204).send();
    } catch (e) { next(e); }
  },
};
