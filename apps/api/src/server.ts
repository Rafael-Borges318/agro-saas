import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/db';
import { logger } from './lib/logger';
import { registerJob, stopAllJobs } from './lib/cron';
import { climaJob } from './jobs/clima.job';
import { precosJob } from './jobs/precos.job';
import { alertasJob } from './jobs/alertas.job';
import { notificacoesJob } from './jobs/notificacoes.job';
import { marketplaceCrawlerJob } from './jobs/marketplace-crawler.job';

async function bootstrap() {
  await prisma.$connect();
  logger.info('Banco de dados conectado');

  registerJob('clima', '0 */6 * * *', climaJob);
  registerJob('precos', '0 8 * * *', precosJob);
  registerJob('alertas', '*/30 * * * *', alertasJob);
  registerJob('notificacoes', '*/10 * * * *', notificacoesJob);
  registerJob('marketplace-crawler', '0 3 * * *', () => marketplaceCrawlerJob().then(() => {}));

  const server = app.listen(env.PORT, () => {
    logger.info(`API rodando em http://localhost:${env.PORT}`);
    logger.info(`Health: http://localhost:${env.PORT}/health`);
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
