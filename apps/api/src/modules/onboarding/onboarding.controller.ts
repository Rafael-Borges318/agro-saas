import { Response, NextFunction } from 'express';
import { onboardingService } from './onboarding.service';
import type { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import type { OnboardingDTO } from './onboarding.schema';

export const onboardingController = {
  async complete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await onboardingService.complete(req.userId!, req.body as OnboardingDTO);
      res.json({ status: 'success', data: user });
    } catch (err) {
      next(err);
    }
  },
};
