import { Router } from 'express';
import { precosController } from './precos.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const precosRouter = Router();

precosRouter.use(authenticate);

// Static routes before /:produto to prevent shadowing
precosRouter.get('/latest', precosController.getLatest);
precosRouter.get('/historico/:produto', precosController.getHistoricoByYear);
precosRouter.get('/', precosController.list);
precosRouter.get('/:produto', precosController.getHistorico);
