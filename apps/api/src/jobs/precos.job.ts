import { logger } from '../lib/logger';
import { precosService } from '../modules/precos/precos.service';

export async function precosJob(): Promise<void> {
  logger.info('[precosJob] Atualizando preços agrícolas...');
  await precosService.seedDailyPrices();
  logger.info('[precosJob] Preços atualizados com sucesso.');
}
