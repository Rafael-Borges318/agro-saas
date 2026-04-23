import { logger } from '../lib/logger';

export async function notificacoesJob(): Promise<void> {
  logger.info('[notificacoesJob] Disparando notificações pendentes...');
  // TODO: enviar push notifications / e-mails para usuários
}
