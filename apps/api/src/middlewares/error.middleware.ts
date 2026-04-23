import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../lib/logger';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'validation_error',
      message: 'Dados inválidos',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  logger.error('Erro não tratado:', err);

  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
