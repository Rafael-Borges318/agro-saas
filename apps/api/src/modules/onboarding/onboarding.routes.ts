import { Router } from 'express';
import { onboardingController } from './onboarding.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { onboardingSchema } from './onboarding.schema';

export const onboardingRouter = Router();

onboardingRouter.post('/', authenticate, validate(onboardingSchema), onboardingController.complete);
