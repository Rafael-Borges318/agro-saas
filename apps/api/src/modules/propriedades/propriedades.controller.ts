import { Request, Response, NextFunction } from 'express';
import { propriedadesService } from './propriedades.service';

export const propriedadesController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await propriedadesService.list(req.query.produtorId as string) }); } catch (e) { next(e); }
  },
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await propriedadesService.findById(req.params.id) }); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ status: 'success', data: await propriedadesService.create(req.body) }); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await propriedadesService.update(req.params.id, req.body) }); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await propriedadesService.remove(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  },
};
