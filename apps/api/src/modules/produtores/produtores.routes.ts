import { Router } from 'express';
import { produtoresController } from './produtores.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const produtoresRouter = Router();

produtoresRouter.use(authenticate);

produtoresRouter.get('/', produtoresController.list);
produtoresRouter.get('/:id', produtoresController.findById);
produtoresRouter.post('/', produtoresController.create);
produtoresRouter.patch('/:id', produtoresController.update);
