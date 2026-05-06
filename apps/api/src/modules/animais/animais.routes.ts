import { Router } from 'express';
import { animaisController } from './animais.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const animaisRouter = Router();

animaisRouter.use(authenticate);

animaisRouter.get('/stats',       animaisController.stats);
animaisRouter.get('/',            animaisController.list);
animaisRouter.get('/:id',         animaisController.findById);
animaisRouter.post('/',           animaisController.create);
animaisRouter.patch('/:id',       animaisController.update);
animaisRouter.delete('/:id',      animaisController.remove);
animaisRouter.get('/:id/eventos', animaisController.listEventos);
animaisRouter.post('/:id/eventos',animaisController.createEvento);
