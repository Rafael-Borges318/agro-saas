import { Request, Response, NextFunction } from 'express';
import { financeiroService } from './financeiro.service';

export const financeiroController = {
  async resumo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await financeiroService.resumo(req.query.propriedadeId as string) }); } catch (e) { next(e); }
  },
  async listDespesas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await financeiroService.listDespesas(req.query.propriedadeId as string) }); } catch (e) { next(e); }
  },
  async createDespesa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ status: 'success', data: await financeiroService.createDespesa(req.body) }); } catch (e) { next(e); }
  },
  async listReceitas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await financeiroService.listReceitas(req.query.propriedadeId as string) }); } catch (e) { next(e); }
  },
  async createReceita(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.status(201).json({ status: 'success', data: await financeiroService.createReceita(req.body) }); } catch (e) { next(e); }
  },
};
