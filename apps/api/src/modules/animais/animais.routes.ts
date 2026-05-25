import { Router } from 'express';
import { animaisController } from './animais.controller';
import { vacinasController } from '../vacinas/vacinas.controller';
import { pesagensController } from '../pesagens/pesagens.controller';
import { reproducaoController } from '../reproducao/reproducao.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const animaisRouter = Router();

animaisRouter.use(authenticate);

// Static routes first — must come before any /:id param routes
animaisRouter.get('/stats',              animaisController.stats);
animaisRouter.get('/vacinas/upcoming',   vacinasController.upcoming);
animaisRouter.get('/reproducao/upcoming',reproducaoController.upcoming);

// Core CRUD
animaisRouter.get('/',            animaisController.list);
animaisRouter.post('/',           animaisController.create);
animaisRouter.get('/:id',         animaisController.findById);
animaisRouter.patch('/:id',       animaisController.update);
animaisRouter.delete('/:id',      animaisController.remove);

// Eventos
animaisRouter.get('/:id/eventos', animaisController.listEventos);
animaisRouter.post('/:id/eventos',animaisController.createEvento);

// Vacinas sub-routes
animaisRouter.get('/:id/vacinas',            vacinasController.list);
animaisRouter.post('/:id/vacinas',           vacinasController.create);
animaisRouter.patch('/:id/vacinas/:vacId',   vacinasController.update);
animaisRouter.delete('/:id/vacinas/:vacId',  vacinasController.remove);

// Pesagens sub-routes
animaisRouter.get('/:id/pesagens',           pesagensController.list);
animaisRouter.post('/:id/pesagens',          pesagensController.create);
animaisRouter.delete('/:id/pesagens/:pesId', pesagensController.remove);

// Reprodução sub-routes
animaisRouter.get('/:id/reproducao',             reproducaoController.list);
animaisRouter.post('/:id/reproducao',            reproducaoController.create);
animaisRouter.patch('/:id/reproducao/:repId',    reproducaoController.update);
animaisRouter.delete('/:id/reproducao/:repId',   reproducaoController.remove);
