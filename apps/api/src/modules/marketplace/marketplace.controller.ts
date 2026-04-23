import { Request, Response, NextFunction } from 'express';
import { marketplaceService } from './marketplace.service';

export const marketplaceController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await marketplaceService.list() }); } catch (e) { next(e); }
  },
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await marketplaceService.findById(req.params.id) }); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ status: 'success', data: await marketplaceService.create(req.body) }); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await marketplaceService.update(req.params.id, req.body) }); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await marketplaceService.remove(req.params.id) }); } catch (e) { next(e); }
  },
};
