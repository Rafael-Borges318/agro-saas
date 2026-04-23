import { Router } from 'express';
import { culturasController } from './culturas.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const culturasRouter = Router();

culturasRouter.use(authenticate);

culturasRouter.get('/', culturasController.list);
culturasRouter.get('/:id', culturasController.findById);
culturasRouter.post('/', culturasController.create);
culturasRouter.patch('/:id', culturasController.update);
culturasRouter.delete('/:id', culturasController.remove);
