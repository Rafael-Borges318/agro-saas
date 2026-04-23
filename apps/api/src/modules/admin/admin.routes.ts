import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole('ADMIN', 'SUPER_ADMIN'));

adminRouter.get('/stats', adminController.stats);
adminRouter.get('/users', adminController.listUsers);
adminRouter.patch('/users/:id/toggle', adminController.toggleUserStatus);
