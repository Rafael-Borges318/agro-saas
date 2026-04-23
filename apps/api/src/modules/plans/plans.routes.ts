import { Router } from 'express';
import { plansController } from './plans.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

export const plansRouter = Router();

plansRouter.get('/', plansController.list);
plansRouter.get('/:id', plansController.findById);
plansRouter.post('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), plansController.create);
plansRouter.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), plansController.update);
