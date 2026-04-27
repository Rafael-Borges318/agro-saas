import { logger } from '../lib/logger';
import { prisma } from '../config/db';
import { precosService } from '../modules/precos/precos.service';

const VARIACAO_ALERTA_PCT = 2; // alert when price moves ≥ 2%

export async function alertasJob(): Promise<void> {
  logger.info('[alertasJob] Verificando alertas de preços...');

  try {
    const [latest, users] = await Promise.all([
      precosService.getLatest(),
      prisma.user.findMany({ where: { isActive: true }, select: { id: true } }),
    ]);

    if (users.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const preco of latest) {
      if (Math.abs(preco.variacaoPct) < VARIACAO_ALERTA_PCT) continue;

      const subiu = preco.variacaoPct > 0;
      const pct = Math.abs(preco.variacaoPct).toFixed(1);
      const tipo = subiu ? 'INFO' : ('ALERTA' as const);
      const titulo = `${preco.produto} ${subiu ? 'subiu' : 'caiu'} ${pct}%`;
      const mensagem =
        `O preço de ${preco.produto} ${subiu ? 'subiu' : 'caiu'} para ` +
        `R$ ${preco.preco.toFixed(2)}/${preco.unidade} (${subiu ? '+' : ''}${preco.variacaoPct.toFixed(1)}%).`;

      for (const { id: userId } of users) {
        // One alert per product per user per day
        const exists = await prisma.notificacao.findFirst({
          where: { userId, titulo, criadoEm: { gte: today } },
        });
        if (exists) continue;

        await prisma.notificacao.create({
          data: { userId, titulo, mensagem, tipo },
        });
      }

      logger.info(`[alertasJob] Alerta gerado: ${titulo}`);
    }
  } catch (err) {
    logger.error('[alertasJob] Erro ao gerar alertas:', err);
  }
}
