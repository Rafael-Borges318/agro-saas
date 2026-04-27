import { logger } from '../lib/logger';
import { climaService } from '../modules/clima/clima.service';
import { env } from '../config/env';

// Major agricultural regions to keep warm in the log / future weather-alert pipeline
const CIDADES_MONITORADAS = ['Porto Alegre', 'Cuiabá', 'Goiânia', 'Ribeirão Preto'];

export async function climaJob(): Promise<void> {
  if (!env.OPENWEATHER_API_KEY) {
    logger.warn('[climaJob] OPENWEATHER_API_KEY não configurada — pulando.');
    return;
  }

  logger.info('[climaJob] Buscando dados meteorológicos...');

  for (const cidade of CIDADES_MONITORADAS) {
    try {
      const d = await climaService.getCurrent({ cidade });
      logger.info(
        `[climaJob] ${d.cidade}: ${d.temperatura}°C, ${d.descricao}` +
          (d.chuva ? ' 🌧️ chuva' : ''),
      );
    } catch (err) {
      logger.warn(`[climaJob] Falha ao buscar clima para ${cidade}:`, err);
    }
  }
}
