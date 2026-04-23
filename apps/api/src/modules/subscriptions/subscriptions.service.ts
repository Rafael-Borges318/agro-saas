import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';
import { addDays } from '../../utils/date';

export const subscriptionsService = {
  async getMySubscription(userId: string) {
    return prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
  },

  async subscribe(userId: string, planId: string) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundError('Plano');

    const dataFim = addDays(new Date(), 30);

    return prisma.subscription.upsert({
      where: { userId },
      update: { planId, status: 'ATIVA', dataInicio: new Date(), dataFim },
      create: { userId, planId, status: 'ATIVA', dataFim },
    });
  },

  async cancel(id: string) {
    const s = await prisma.subscription.findUnique({ where: { id } });
    if (!s) throw new NotFoundError('Assinatura');
    return prisma.subscription.update({ where: { id }, data: { status: 'CANCELADA' } });
  },
};
