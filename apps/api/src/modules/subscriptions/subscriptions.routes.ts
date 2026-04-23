import { Router } from 'express';
import { subscriptionsController } from './subscriptions.controller';
import { authenticate } from '../../middlewares/auth.middleware';

export const subscriptionsRouter = Router();

subscriptionsRouter.use(authenticate);
subscriptionsRouter.get('/me', subscriptionsController.getMySubscription);
subscriptionsRouter.post('/', subscriptionsController.subscribe);
subscriptionsRouter.patch('/:id/cancel', subscriptionsController.cancel);
