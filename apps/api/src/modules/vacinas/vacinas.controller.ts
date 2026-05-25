import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../utils/AppError';
import { vacinasService, createVacinaSchema, updateVacinaSchema } from './vacinas.service';

function ctx(req: AuthenticatedRequest) {
  if (!req.userId) throw new UnauthorizedError();
  return { userId: req.userId, userRole: req.userRole ?? 'PRODUTOR' };
}

export const vacinasController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      res.json({ status: 'success', data: await vacinasService.list(userId, userRole, req.params.id) });
    } catch (e) { next(e); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = createVacinaSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.status(201).json({ status: 'success', data: await vacinasService.create(userId, userRole, req.params.id, parsed.data) });
    } catch (e) { next(e); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = updateVacinaSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.json({ status: 'success', data: await vacinasService.update(userId, userRole, req.params.id, req.params.vacId, parsed.data) });
    } catch (e) { next(e); }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      await vacinasService.remove(userId, userRole, req.params.id, req.params.vacId);
      res.status(204).send();
    } catch (e) { next(e); }
  },

  async upcoming(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const days = Number(req.query.days) || 30;
      res.json({ status: 'success', data: await vacinasService.upcoming(userId, userRole, days) });
    } catch (e) { next(e); }
  },
};
