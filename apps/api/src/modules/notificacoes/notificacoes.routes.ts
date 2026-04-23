import { Router } from 'express';
import { notificacoesController } from './notificacoes.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const notificacoesRouter = Router();

notificacoesRouter.use(authenticate);
notificacoesRouter.get('/', notificacoesController.list);
notificacoesRouter.patch('/:id/ler', notificacoesController.markAsRead);
notificacoesRouter.delete('/:id', notificacoesController.remove);
