import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { UnauthorizedError } from '../utils/AppError';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token não fornecido');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}

export function optionalAuthenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.split(' ')[1]);
      req.userId   = payload.sub;
      req.userRole = payload.role;
    } catch {
      // invalid token — proceed as unauthenticated
    }
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      throw new UnauthorizedError('Permissão insuficiente');
    }
    next();
  };
}
