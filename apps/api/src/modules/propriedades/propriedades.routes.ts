import { Router } from 'express';
import { propriedadesController } from './propriedades.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const propriedadesRouter = Router();

propriedadesRouter.use(authenticate);

propriedadesRouter.get('/', propriedadesController.list);
propriedadesRouter.get('/:id', propriedadesController.findById);
propriedadesRouter.post('/', propriedadesController.create);
propriedadesRouter.patch('/:id', propriedadesController.update);
propriedadesRouter.delete('/:id', propriedadesController.remove);
