import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';

export const adminController = {
  async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await adminService.stats() }); } catch (e) { next(e); }
  },
  async listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await adminService.listUsers() }); } catch (e) { next(e); }
  },
  async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { res.json({ status: 'success', data: await adminService.toggleUserStatus(req.params.id) }); } catch (e) { next(e); }
  },
};
