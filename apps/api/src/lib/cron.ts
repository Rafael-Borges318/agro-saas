import cron from 'node-cron';
import { logger } from './logger';

type JobName = string;
const jobs = new Map<JobName, cron.ScheduledTask>();

export function registerJob(name: JobName, schedule: string, fn: () => Promise<void>): void {
  if (jobs.has(name)) {
    logger.warn(`Job "${name}" já está registrado — ignorando.`);
    return;
  }

  const task = cron.schedule(schedule, async () => {
    logger.info(`[cron] Iniciando job: ${name}`);
    try {
      await fn();
      logger.info(`[cron] Job concluído: ${name}`);
    } catch (err) {
      logger.error(`[cron] Erro no job "${name}":`, err);
    }
  });

  jobs.set(name, task);
  logger.info(`[cron] Job registrado: ${name} (${schedule})`);
}

export function stopAllJobs(): void {
  jobs.forEach((task, name) => {
    task.stop();
    logger.info(`[cron] Job parado: ${name}`);
  });
}
