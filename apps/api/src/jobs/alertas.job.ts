import { logger } from '../lib/logger';

export async function alertasJob(): Promise<void> {
  logger.info('[alertasJob] Verificando alertas...');
  // TODO: checar limiares de preço, clima extremo, vacinas vencidas, etc.
}
