import { prisma } from '../config/db';
import { env } from '../config/env';
import { logger } from '../lib/logger';

const ML_API_BASE = 'https://api.mercadolibre.com/sites/MLB/search';
const ML_CATEGORY  = 'MLB1499'; // Maquinaria Agropecuária
const RESULTS_PER_QUERY = 10;
const DELAY_BETWEEN_QUERIES_MS = 1500;

const QUERIES = [
  'trator agricola',
  'colheitadeira',
  'plantadeira agricola',
  'pulverizador agricola',
  'grade aradora',
  'silo agricola',
] as const;

/* ─── ML API Types ───────────────────────────────────────────────────────── */

interface MlItem {
  id: string;
  title: string;
  price: number | null;
  thumbnail: string | null;
  permalink: string;
}

interface MlSearchResponse {
  results: MlItem[];
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

async function fetchMlItems(query: string): Promise<MlItem[]> {
  const url = new URL(ML_API_BASE);
  url.searchParams.set('q', query);
  url.searchParams.set('category', ML_CATEGORY);
  url.searchParams.set('limit', String(RESULTS_PER_QUERY));

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'agro-saas-crawler/1.0' },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`ML API responded ${res.status} for query "${query}"`);
  }

  const body = (await res.json()) as MlSearchResponse;
  return body.results ?? [];
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/* ─── Job ────────────────────────────────────────────────────────────────── */

export interface CrawlerResult {
  inserted: number;
  skipped: number;  // already existed
  ignored: number;  // no price or invalid
}

export async function marketplaceCrawlerJob(): Promise<CrawlerResult> {
  const produtorId = env.CRAWLER_PRODUTOR_ID;

  if (!produtorId) {
    logger.warn('[marketplaceCrawlerJob] CRAWLER_PRODUTOR_ID não configurado — job encerrado sem alterações.');
    return { inserted: 0, skipped: 0, ignored: 0 };
  }

  logger.info('[marketplaceCrawlerJob] Iniciando crawler do MercadoLivre...');

  let inserted = 0;
  let skipped  = 0;
  let ignored  = 0;

  for (const query of QUERIES) {
    logger.info(`[marketplaceCrawlerJob] Buscando: "${query}"`);

    let items: MlItem[];
    try {
      items = await fetchMlItems(query);
    } catch (err) {
      logger.error(`[marketplaceCrawlerJob] Falha ao buscar "${query}":`, err);
      continue;
    }

    for (const item of items) {
      // Ignore items without a usable price
      if (!item.price || item.price <= 0) {
        ignored++;
        continue;
      }

      const titulo = item.title.trim().slice(0, 120);

      // Deduplicate by title (case-insensitive exact match)
      const exists = await prisma.marketplaceProduct.findFirst({
        where: { titulo: { equals: titulo, mode: 'insensitive' } },
        select: { id: true },
      });

      if (exists) {
        skipped++;
        continue;
      }

      const imageUrl = item.thumbnail?.startsWith('http') ? item.thumbnail : undefined;

      await prisma.marketplaceProduct.create({
        data: {
          produtorId,
          titulo,
          descricao:   'Listagem importada do MercadoLivre. Referência de preço de mercado.',
          categoria:   'MAQUINARIOS',
          preco:       item.price,
          quantidade:  1,
          unidade:     'un',
          imageUrl,
          externalUrl: item.permalink,
          status:      'ATIVO',
        },
      });

      inserted++;
    }

    if (QUERIES.indexOf(query) < QUERIES.length - 1) {
      await sleep(DELAY_BETWEEN_QUERIES_MS);
    }
  }

  logger.info(
    `[marketplaceCrawlerJob] Concluído — inseridos: ${inserted}, já existiam: ${skipped}, sem preço: ${ignored}`,
  );

  return { inserted, skipped, ignored };
}
