import { logger } from '../lib/logger';

export async function precosJob(): Promise<void> {
  logger.info('[precosJob] Atualizando preços agrícolas...');
  // TODO: integrar com API de preços (ex: CEPEA, CONAB)
  // await fetchAndStorePrices();
}
