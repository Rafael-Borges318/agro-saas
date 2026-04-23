import { Request, Response, NextFunction } from 'express';
import { produtoresService } from './produtores.service';

export const produtoresController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await produtoresService.list() }); } catch (e) { next(e); }
  },
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await produtoresService.findById(req.params.id) }); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).userId;
      const data = await produtoresService.create(userId, req.body);
      res.status(201).json({ status: 'success', data });
    } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await produtoresService.update(req.params.id, req.body) }); } catch (e) { next(e); }
  },
};
