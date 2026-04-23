import { logger } from '../lib/logger';

export async function climaJob(): Promise<void> {
  logger.info('[climaJob] Buscando dados meteorológicos...');
  // TODO: integrar com API de clima (ex: OpenWeatherMap)
  // await fetchAndStoreWeatherData();
}
