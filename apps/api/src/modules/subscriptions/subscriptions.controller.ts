import { Request, Response, NextFunction } from 'express';
import { subscriptionsService } from './subscriptions.service';

export const subscriptionsController = {
  async getMySubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await subscriptionsService.getMySubscription((req as any).userId) }); } catch (e) { next(e); }
  },
  async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await subscriptionsService.subscribe((req as any).userId, req.body.planId);
      res.status(201).json({ status: 'success', data });
    } catch (e) { next(e); }
  },
  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await subscriptionsService.cancel(req.params.id) }); } catch (e) { next(e); }
  },
};
