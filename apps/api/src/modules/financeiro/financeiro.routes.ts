import { Router } from 'express';
import { financeiroController } from './financeiro.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const financeiroRouter = Router();

financeiroRouter.use(authenticate);
financeiroRouter.get('/resumo', financeiroController.resumo);
financeiroRouter.get('/despesas', financeiroController.listDespesas);
financeiroRouter.post('/despesas', financeiroController.createDespesa);
financeiroRouter.get('/receitas', financeiroController.listReceitas);
financeiroRouter.post('/receitas', financeiroController.createReceita);
