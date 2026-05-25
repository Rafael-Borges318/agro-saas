import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
} from '@prisma/client/runtime/library';
import { AppError } from '../utils/AppError';
import { logger } from '../lib/logger';

// Prisma error codes → HTTP status + mensagem legível
const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2000: { status: 422, message: 'Valor muito longo para o campo' },
  P2001: { status: 404, message: 'Registro não encontrado' },
  P2002: { status: 409, message: 'Registro duplicado — valor já existe' },
  P2003: { status: 409, message: 'Violação de chave estrangeira' },
  P2004: { status: 409, message: 'Restrição de banco de dados violada' },
  P2005: { status: 422, message: 'Valor inválido para o campo' },
  P2006: { status: 422, message: 'Valor fornecido inválido' },
  P2011: { status: 422, message: 'Campo obrigatório não pode ser nulo' },
  P2014: { status: 409, message: 'Violação de relação entre registros' },
  P2021: { status: 503, message: 'Tabela não encontrada no banco de dados' },
  P2025: { status: 404, message: 'Registro não encontrado' },
};

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Erros operacionais conhecidos
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Erros de validação Zod
  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'validation_error',
      message: 'Dados inválidos',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Erros de query do Prisma (ex: registro não encontrado, constraint violada)
  if (err instanceof PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP[err.code];
    logger.error(`Prisma ${err.code}:`, { meta: err.meta, message: err.message });
    res.status(mapped?.status ?? 500).json({
      status: 'error',
      message: mapped?.message ?? 'Erro no banco de dados',
    });
    return;
  }

  // Erros desconhecidos do Prisma (ex: query malformada)
  if (err instanceof PrismaClientUnknownRequestError) {
    logger.error('Prisma erro desconhecido:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Erro inesperado no banco de dados',
    });
    return;
  }

  // Falha de inicialização/conexão do Prisma (ex: tabela não existe, DB offline)
  if (err instanceof PrismaClientInitializationError) {
    logger.error('Prisma falha de inicialização:', err.message);
    res.status(503).json({
      status: 'error',
      message: 'Serviço de banco de dados indisponível',
    });
    return;
  }

  // Erro genérico não tratado
  logger.error('Erro não tratado:', { name: err.name, message: err.message, stack: err.stack });
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}
