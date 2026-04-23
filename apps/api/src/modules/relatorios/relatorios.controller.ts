import { Request, Response, NextFunction } from 'express';
import { relatoriosService } from './relatorios.service';

export const relatoriosController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await relatoriosService.list(req.query.propriedadeId as string) }); } catch (e) { next(e); }
  },
  async gerar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propriedadeId, tipo, titulo } = req.body;
      res.status(201).json({ status: 'success', data: await relatoriosService.gerar(propriedadeId, tipo, titulo) });
    } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await relatoriosService.remove(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  },
};
