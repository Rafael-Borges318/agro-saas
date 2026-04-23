import { Router } from 'express';
import { precosController } from './precos.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const precosRouter = Router();

precosRouter.use(authenticate);
precosRouter.get('/', precosController.list);
precosRouter.get('/:produto', precosController.getByProduto);
