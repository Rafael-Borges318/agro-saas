import { Request, Response, NextFunction } from 'express';
import { notificacoesService } from './notificacoes.service';

export const notificacoesController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await notificacoesService.list((req as any).userId) }); } catch (e) { next(e); }
  },
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await notificacoesService.markAsRead(req.params.id) }); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await notificacoesService.remove(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  },
};
