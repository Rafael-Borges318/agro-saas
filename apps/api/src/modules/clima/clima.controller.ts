import { Request, Response, NextFunction } from 'express';
import { climaService, type ClimaQuery } from './clima.service';

function extractQuery(req: Request): ClimaQuery {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
  const cidade = (req.query.cidade as string | undefined) ?? 'São Paulo';
  return lat !== undefined && lon !== undefined ? { lat, lon } : { cidade };
}

export const climaController = {
  async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await climaService.getCurrent(extractQuery(req)) });
    } catch (e) {
      next(e);
    }
  },

  async getForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await climaService.getForecast(extractQuery(req)) });
    } catch (e) {
      next(e);
    }
  },
};
