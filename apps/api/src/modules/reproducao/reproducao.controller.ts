import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../utils/AppError';
import { reproducaoService, createReproducaoSchema, updateReproducaoSchema } from './reproducao.service';

function ctx(req: AuthenticatedRequest) {
  if (!req.userId) throw new UnauthorizedError();
  return { userId: req.userId, userRole: req.userRole ?? 'PRODUTOR' };
}

export const reproducaoController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      res.json({ status: 'success', data: await reproducaoService.list(userId, userRole, req.params.id) });
    } catch (e) { next(e); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = createReproducaoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.status(201).json({ status: 'success', data: await reproducaoService.create(userId, userRole, req.params.id, parsed.data) });
    } catch (e) { next(e); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = updateReproducaoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.json({ status: 'success', data: await reproducaoService.update(userId, userRole, req.params.id, req.params.repId, parsed.data) });
    } catch (e) { next(e); }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      await reproducaoService.remove(userId, userRole, req.params.id, req.params.repId);
      res.status(204).send();
    } catch (e) { next(e); }
  },

  async upcoming(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const days = Number(req.query.days) || 14;
      res.json({ status: 'success', data: await reproducaoService.upcoming(userId, userRole, days) });
    } catch (e) { next(e); }
  },
};
