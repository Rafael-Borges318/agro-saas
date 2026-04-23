import { Router } from 'express';
import { climaController } from './clima.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const climaRouter = Router();

climaRouter.use(authenticate);
climaRouter.get('/', climaController.getCurrent);
climaRouter.get('/forecast', climaController.getForecast);
