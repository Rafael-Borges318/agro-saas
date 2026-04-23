import { Request, Response, NextFunction } from 'express';
import { precosService } from './precos.service';

export const precosController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await precosService.list() }); } catch (e) { next(e); }
  },
  async getByProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await precosService.getByProduto(req.params.produto) }); } catch (e) { next(e); }
  },
};
