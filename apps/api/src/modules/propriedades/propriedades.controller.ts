import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../utils/AppError';
import { propriedadesService } from './propriedades.service';

export const propriedadesController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new UnauthorizedError();
      res.json({ status: 'success', data: await propriedadesService.listForUser(req.userId, req.userRole ?? 'PRODUTOR') });
    } catch (e) { next(e); }
  },
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await propriedadesService.findById(req.params.id) }); } catch (e) { next(e); }
  },
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ status: 'success', data: await propriedadesService.create(req.body) }); } catch (e) { next(e); }
  },
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await propriedadesService.update(req.params.id, req.body) }); } catch (e) { next(e); }
  },
  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try { await propriedadesService.remove(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  },
};
