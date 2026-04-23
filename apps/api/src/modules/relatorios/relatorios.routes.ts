import { Router } from 'express';
import { relatoriosController } from './relatorios.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const relatoriosRouter = Router();

relatoriosRouter.use(authenticate);
relatoriosRouter.get('/', relatoriosController.list);
relatoriosRouter.post('/gerar', relatoriosController.gerar);
relatoriosRouter.delete('/:id', relatoriosController.remove);
