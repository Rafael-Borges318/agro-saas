import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../utils/AppError';
import {
  marketplaceService,
  createProductSchema,
  updateProductSchema,
  updateStatusSchema,
  listFiltersSchema,
} from './marketplace.service';
import { marketplaceCrawlerJob } from '../../jobs/marketplace-crawler.job';

function requireAuth(req: AuthenticatedRequest) {
  if (!req.userId) throw new UnauthorizedError();
  return { userId: req.userId, userRole: req.userRole ?? 'PRODUTOR' };
}

export const marketplaceController = {

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listFiltersSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const result = await marketplaceService.list(parsed.data, req.userId);
      res.json({ status: 'success', ...result });
    } catch (e) { next(e); }
  },

  async featured(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await marketplaceService.featured() });
    } catch (e) { next(e); }
  },

  async recent(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await marketplaceService.recent() });
    } catch (e) { next(e); }
  },

  async publicStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await marketplaceService.publicStats() });
    } catch (e) { next(e); }
  },

  async categoryCounts(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await marketplaceService.categoryCounts() });
    } catch (e) { next(e); }
  },

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await marketplaceService.findById(req.params.id, req.userId) });
    } catch (e) { next(e); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = requireAuth(req);
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.status(201).json({ status: 'success', data: await marketplaceService.create(userId, parsed.data) });
    } catch (e) { next(e); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = requireAuth(req);
      const parsed = updateProductSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.json({ status: 'success', data: await marketplaceService.update(userId, userRole, req.params.id, parsed.data) });
    } catch (e) { next(e); }
  },

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = requireAuth(req);
      const parsed = updateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ status: 'validation_error', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      res.json({ status: 'success', data: await marketplaceService.updateStatus(userId, userRole, req.params.id, parsed.data.status) });
    } catch (e) { next(e); }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = requireAuth(req);
      await marketplaceService.remove(userId, userRole, req.params.id);
      res.status(204).send();
    } catch (e) { next(e); }
  },

  async toggleFavorito(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = requireAuth(req);
      res.json({ status: 'success', data: await marketplaceService.toggleFavorito(userId, req.params.id) });
    } catch (e) { next(e); }
  },

  async myFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = requireAuth(req);
      res.json({ status: 'success', data: await marketplaceService.myFavorites(userId) });
    } catch (e) { next(e); }
  },

  async myListings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = requireAuth(req);
      res.json({ status: 'success', data: await marketplaceService.myListings(userId) });
    } catch (e) { next(e); }
  },

  async myStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = requireAuth(req);
      res.json({ status: 'success', data: await marketplaceService.myStats(userId) });
    } catch (e) { next(e); }
  },

  async trackContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tipo = typeof req.body?.tipo === 'string' ? req.body.tipo.slice(0, 30) : 'desconhecido';
      await marketplaceService.trackContact(req.params.id, tipo, req.userId);
      res.status(204).send();
    } catch (e) { next(e); }
  },

  async runCrawler(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await marketplaceCrawlerJob();
      res.json({ status: 'success', data: result });
    } catch (e) { next(e); }
  },
};
