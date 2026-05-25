import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/db';
import { logger } from './lib/logger';
import { hashPassword } from './lib/bcrypt';
import { addDays } from './utils/date';
import { registerJob, stopAllJobs } from './lib/cron';
import { climaJob } from './jobs/clima.job';
import { precosJob } from './jobs/precos.job';
import { alertasJob } from './jobs/alertas.job';
import { notificacoesJob } from './jobs/notificacoes.job';
import { marketplaceCrawlerJob } from './jobs/marketplace-crawler.job';
import { precosService } from './modules/precos/precos.service';

async function seedDatabase() {
  // ─── Admin user ───────────────────────────────────────────────────────────
  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const passwordHash = await hashPassword(adminPassword);
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: adminEmail,
          passwordHash,
          role: 'ADMIN',
          onboardingCompleted: true,
        },
      });
      logger.info(`Admin criado: ${adminEmail}`);
    }
  }

  // ─── Default plans ────────────────────────────────────────────────────────
  const planCount = await prisma.plan.count();
  if (planCount === 0) {
    await prisma.plan.createMany({
      data: [
        {
          nome: 'Gratuito',
          preco: 0,
          descricao: 'Ideal para começar a gestão da sua propriedade rural.',
          features: [
            'Preços de mercado básicos',
            'Clima e previsão de 7 dias',
            'Calendário agrícola simplificado',
            '1 cultura principal',
          ],
          limitePropriedades: 1,
          limiteAnimais: 10,
        },
        {
          nome: 'Produtor',
          preco: 49,
          descricao: 'Para produtores que precisam de controle completo da fazenda.',
          features: [
            'Todas as funcionalidades gratuitas',
            'Controle financeiro completo',
            'Gestão de rebanho',
            'Alertas personalizados',
            'Até 5 culturas',
            'Suporte prioritário',
          ],
          limitePropriedades: 3,
          limiteAnimais: 100,
        },
        {
          nome: 'Cooperativa',
          preco: 199,
          descricao: 'Para cooperativas e grandes operações agropecuárias.',
          features: [
            'Tudo do plano Produtor',
            'Painel administrativo',
            'Gestão de múltiplos produtores',
            'Relatórios avançados',
            'API de integração',
            'Suporte dedicado',
          ],
          limitePropriedades: 20,
          limiteAnimais: 500,
        },
      ],
    });
    logger.info('Planos padrão criados');
  }

  // ─── Ensure admin has a subscription (if plans now exist) ─────────────────
  if (adminEmail) {
    const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (adminUser) {
      const hasSubscription = await prisma.subscription.findUnique({ where: { userId: adminUser.id } });
      if (!hasSubscription) {
        const topPlan = await prisma.plan.findFirst({ orderBy: { preco: 'desc' } });
        if (topPlan) {
          await prisma.subscription.create({
            data: {
              userId: adminUser.id,
              planId: topPlan.id,
              status: 'ATIVA',
              dataFim: addDays(new Date(), 36500), // ~100 years
            },
          });
        }
      }
    }
  }
}

async function bootstrap() {
  await prisma.$connect();
  logger.info('Banco de dados conectado');

  await seedDatabase();

  registerJob('clima', '0 */6 * * *', climaJob);
  registerJob('precos', '0 8 * * *', precosJob);
  registerJob('alertas', '*/30 * * * *', alertasJob);
  registerJob('notificacoes', '*/10 * * * *', notificacoesJob);
  registerJob('marketplace-crawler', '0 3 * * *', () => marketplaceCrawlerJob().then(() => {}));

  // Start listening FIRST so the server is immediately reachable
  const server = app.listen(env.PORT, () => {
    logger.info(`API rodando em http://localhost:${env.PORT}`);
    logger.info(`Health: http://localhost:${env.PORT}/health`);

    // Seed price history in the background — non-blocking so the server stays responsive
    precosService
      .seedYearlyHistory()
      .then(() => precosService.seedDailyPrices())
      .catch((err) => logger.warn('[precos] Falha no seed de preços:', err));
  });

  const shutdown = async () => {
    logger.info('Encerrando servidor...');
    stopAllJobs();
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  logger.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
