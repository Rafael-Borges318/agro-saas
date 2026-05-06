import { Router } from 'express';
import { financeiroController } from './financeiro.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createTransacaoSchema } from './financeiro.service';

export const financeiroRouter = Router();

// All financial routes require authentication
financeiroRouter.use(authenticate);

financeiroRouter.get('/resumo',                      financeiroController.resumo);
financeiroRouter.get('/grafico',                     financeiroController.grafico);
financeiroRouter.get('/transacoes',                  financeiroController.listTransacoes);
financeiroRouter.post('/transacoes',  validate(createTransacaoSchema), financeiroController.createTransacao);
financeiroRouter.delete('/transacoes/:id',           financeiroController.deleteTransacao);
