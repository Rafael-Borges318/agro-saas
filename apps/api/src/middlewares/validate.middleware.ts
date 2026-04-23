import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestField = 'body' | 'params' | 'query';

export function validate(schema: ZodSchema, field: RequestField = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[field]);
    if (!result.success) {
      next(result.error);
      return;
    }
    req[field] = result.data;
    next();
  };
}
