import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { logger } from '../../lib/logger';
import {
  financeiroService,
  queryTransacoesSchema,
  deleteTransacaoQuerySchema,
} from './financeiro.service';
import { UnauthorizedError } from '../../utils/AppError';

function requireUserContext(req: AuthenticatedRequest): { userId: string; userRole: string } {
  if (!req.userId) throw new UnauthorizedError();
  return { userId: req.userId, userRole: req.userRole ?? 'PRODUTOR' };
}

export const financeiroController = {
  async resumo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = requireUserContext(req);
      const data = await financeiroService.resumo(userId, userRole);
      res.json({ status: 'success', data });
    } catch (e) {
      logger.error('[financeiro] GET /resumo falhou:', e);
      next(e);
    }
  },

  async listTransacoes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = requireUserContext(req);

      const parsed = queryTransacoesSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(422).json({
          status: 'validation_error',
          message: 'Parâmetros de filtro inválidos',
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const data = await financeiroService.listTransacoes(userId, userRole, parsed.data);
      res.json({ status: 'success', data });
    } catch (e) {
      logger.error('[financeiro] GET /transacoes falhou:', e);
      next(e);
    }
  },

  async createTransacao(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = requireUserContext(req);
      const data = await financeiroService.createTransacao(userId, userRole, req.body);
      res.status(201).json({ status: 'success', data });
    } catch (e) {
      logger.error('[financeiro] POST /transacoes falhou:', e);
      next(e);
    }
  },

  async deleteTransacao(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = requireUserContext(req);
      const { id } = req.params;

      const result = deleteTransacaoQuerySchema.safeParse(req.query);
      if (!result.success) {
        res.status(422).json({
          status: 'validation_error',
          message: 'Informe o tipo da transação: receita ou despesa',
        });
        return;
      }

      await financeiroService.deleteTransacao(userId, userRole, id, result.data.tipo);
      res.status(204).send();
    } catch (e) {
      logger.error('[financeiro] DELETE /transacoes/:id falhou:', e);
      next(e);
    }
  },

  async grafico(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userRole } = requireUserContext(req);
      const data = await financeiroService.grafico(userId, userRole);
      res.json({ status: 'success', data });
    } catch (e) {
      logger.error('[financeiro] GET /grafico falhou:', e);
      next(e);
    }
  },
};
