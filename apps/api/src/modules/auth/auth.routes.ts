import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRateLimit } from '../../middlewares/rate-limit.middleware';
import { loginSchema, registerSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post('/register', authRateLimit, validate(registerSchema), authController.register);
authRouter.post('/login', authRateLimit, validate(loginSchema), authController.login);
authRouter.get('/me', authenticate, authController.me);
