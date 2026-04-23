import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/', requireRole('ADMIN', 'SUPER_ADMIN'), usersController.list);
usersRouter.get('/:id', usersController.findById);
usersRouter.patch('/:id', usersController.update);
usersRouter.delete('/:id', requireRole('ADMIN', 'SUPER_ADMIN'), usersController.remove);
