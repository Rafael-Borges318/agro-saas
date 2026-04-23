import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';

export const usersController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await usersService.list(page, limit);
      res.json({ status: 'success', ...result });
    } catch (err) { next(err); }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.findById(req.params.id);
      res.json({ status: 'success', data: user });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.update(req.params.id, req.body);
      res.json({ status: 'success', data: user });
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.remove(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
