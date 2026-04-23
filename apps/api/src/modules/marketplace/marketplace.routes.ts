import { Router } from 'express';
import { marketplaceController } from './marketplace.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const marketplaceRouter = Router();

marketplaceRouter.get('/', marketplaceController.list);
marketplaceRouter.get('/:id', marketplaceController.findById);
marketplaceRouter.post('/', authenticate, marketplaceController.create);
marketplaceRouter.patch('/:id', authenticate, marketplaceController.update);
marketplaceRouter.delete('/:id', authenticate, marketplaceController.remove);
