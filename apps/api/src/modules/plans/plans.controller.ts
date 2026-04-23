import { Request, Response, NextFunction } from 'express';
import { plansService } from './plans.service';

export const plansController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await plansService.list() }); } catch (e) { next(e); }
  },
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await plansService.findById(req.params.id) }); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ status: 'success', data: await plansService.create(req.body) }); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await plansService.update(req.params.id, req.body) }); } catch (e) { next(e); }
  },
};
