import { Router } from 'express';
import { animaisController } from './animais.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const animaisRouter = Router();

animaisRouter.use(authenticate);

animaisRouter.get('/', animaisController.list);
animaisRouter.get('/:id', animaisController.findById);
animaisRouter.post('/', animaisController.create);
animaisRouter.patch('/:id', animaisController.update);
animaisRouter.delete('/:id', animaisController.remove);
