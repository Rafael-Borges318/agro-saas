import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../utils/AppError';
import {
  animaisService,
  createAnimalSchema,
  updateAnimalSchema,
  createEventoSchema,
  listAnimaisSchema,
} from './animais.service';

function ctx(req: AuthenticatedRequest) {
  if (!req.userId) throw new UnauthorizedError();
  return { userId: req.userId, userRole: req.userRole ?? 'PRODUTOR' };
}

export const animaisController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = listAnimaisSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.json({ status: 'success', data: await animaisService.list(userId, userRole, parsed.data) });
    } catch (e) { next(e); }
  },

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      res.json({ status: 'success', data: await animaisService.findById(userId, userRole, req.params.id) });
    } catch (e) { next(e); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = createAnimalSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.status(201).json({ status: 'success', data: await animaisService.create(userId, userRole, parsed.data) });
    } catch (e) { next(e); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = updateAnimalSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.json({ status: 'success', data: await animaisService.update(userId, userRole, req.params.id, parsed.data) });
    } catch (e) { next(e); }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      await animaisService.remove(userId, userRole, req.params.id);
      res.status(204).send();
    } catch (e) { next(e); }
  },

  async stats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      res.json({ status: 'success', data: await animaisService.stats(userId, userRole) });
    } catch (e) { next(e); }
  },

  async listEventos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      res.json({ status: 'success', data: await animaisService.listEventos(userId, userRole, req.params.id) });
    } catch (e) { next(e); }
  },

  async createEvento(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = ctx(req);
      const parsed = createEventoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.status(201).json({
        status: 'success',
        data: await animaisService.createEvento(userId, userRole, req.params.id, parsed.data),
      });
    } catch (e) { next(e); }
  },
};
