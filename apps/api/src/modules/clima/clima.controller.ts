import { Request, Response, NextFunction } from 'express';
import { climaService } from './clima.service';

export const climaController = {
  async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cidade = (req.query.cidade as string) || 'São Paulo';
      res.json({ status: 'success', data: await climaService.getCurrent(cidade) });
    } catch (e) { next(e); }
  },
  async getForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cidade = (req.query.cidade as string) || 'São Paulo';
      res.json({ status: 'success', data: await climaService.getForecast(cidade) });
    } catch (e) { next(e); }
  },
};
