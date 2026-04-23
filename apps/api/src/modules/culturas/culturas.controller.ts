import { Request, Response, NextFunction } from 'express';
import { culturasService } from './culturas.service';

export const culturasController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await culturasService.list(req.query.propriedadeId as string) }); } catch (e) { next(e); }
  },
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await culturasService.findById(req.params.id) }); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ status: 'success', data: await culturasService.create(req.body) }); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await culturasService.update(req.params.id, req.body) }); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await culturasService.remove(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  },
};
