import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { relatoriosService } from './relatorios.service';
import { prisma } from '../../config/db';
import { ForbiddenError } from '../../utils/AppError';

async function resolveProdutorId(userId: string): Promise<string> {
  const p = await prisma.produtor.findUnique({ where: { userId }, select: { id: true } });
  if (!p) throw new ForbiddenError('Perfil de produtor não encontrado. Conclua o onboarding primeiro.');
  return p.id;
}

export const relatoriosController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ status: 'success', data: await relatoriosService.list(req.query.propriedadeId as string) });
    } catch (e) { next(e); }
  },

  async gerar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propriedadeId, tipo, titulo } = req.body;
      res.status(201).json({ status: 'success', data: await relatoriosService.gerar(propriedadeId, tipo, titulo) });
    } catch (e) { next(e); }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await relatoriosService.remove(req.params.id);
      res.status(204).send();
    } catch (e) { next(e); }
  },

  async financeiro(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const produtorId = await resolveProdutorId(req.userId!);
      const mes = typeof req.query.mes === 'string' ? req.query.mes : undefined;
      res.json({ status: 'success', data: await relatoriosService.gerarRelatorioFinanceiro(produtorId, mes) });
    } catch (e) { next(e); }
  },

  async rebanho(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const produtorId = await resolveProdutorId(req.userId!);
      res.json({ status: 'success', data: await relatoriosService.gerarRelatorioRebanho(produtorId) });
    } catch (e) { next(e); }
  },
};
