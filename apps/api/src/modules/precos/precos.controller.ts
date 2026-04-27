import { Request, Response, NextFunction } from 'express';
import { precosService } from './precos.service';

export const precosController = {
  async getLatest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const estado = req.query.estado as string | undefined;
      res.json({ status: 'success', data: await precosService.getLatest(estado) });
    } catch (e) {
      next(e);
    }
  },

  async getHistoricoByYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      res.json({
        status: 'success',
        data: await precosService.getHistoricoByYear(req.params.produto, year),
      });
    } catch (e) {
      next(e);
    }
  },

  async getHistorico(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const estado = req.query.estado as string | undefined;
      res.json({
        status: 'success',
        data: await precosService.getHistorico(req.params.produto, estado),
      });
    } catch (e) {
      next(e);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await precosService.list() });
    } catch (e) {
      next(e);
    }
  },
};
