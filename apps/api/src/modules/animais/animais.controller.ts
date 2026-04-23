import { Request, Response, NextFunction } from 'express';
import { animaisService } from './animais.service';

export const animaisController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await animaisService.list(req.query.propriedadeId as string) }); } catch (e) { next(e); }
  },
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await animaisService.findById(req.params.id) }); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ status: 'success', data: await animaisService.create(req.body) }); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await animaisService.update(req.params.id, req.body) }); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await animaisService.remove(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  },
};
