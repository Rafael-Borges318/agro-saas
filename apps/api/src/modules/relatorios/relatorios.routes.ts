import { Router } from 'express';
import { relatoriosController } from './relatorios.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const relatoriosRouter = Router();

relatoriosRouter.use(authenticate);

// Legacy routes
relatoriosRouter.get('/',          relatoriosController.list);
relatoriosRouter.post('/gerar',    relatoriosController.gerar);
relatoriosRouter.delete('/:id',    relatoriosController.remove);

// New analytical reports
relatoriosRouter.get('/financeiro', relatoriosController.financeiro);
relatoriosRouter.get('/rebanho',    relatoriosController.rebanho);
