import { prisma } from '../../config/db';
import { logger } from '../../lib/logger';

// All 27 commodities matching shared constants (18 Vegetal + 9 Animal)
const COMMODITIES = [
  // Vegetal
  { produto: 'Soja',            unidade: 'sc 60kg',   precoBase: 142.50, estado: 'PR' },
  { produto: 'Milho',           unidade: 'sc 60kg',   precoBase: 68.90,  estado: 'PR' },
  { produto: 'Arroz',           unidade: 'sc 50kg',   precoBase: 82.40,  estado: 'RS' },
  { produto: 'Trigo',           unidade: 'sc 60kg',   precoBase: 95.30,  estado: 'PR' },
  { produto: 'Feijão',          unidade: 'sc 60kg',   precoBase: 215.00, estado: 'PR' },
  { produto: 'Café',            unidade: 'sc 60kg',   precoBase: 890.00, estado: 'SP' },
  { produto: 'Algodão',         unidade: '@',         precoBase: 145.00, estado: 'MT' },
  { produto: 'Cana-de-açúcar',  unidade: 'ton',       precoBase: 38.50,  estado: 'SP' },
  { produto: 'Sorgo',           unidade: 'sc 60kg',   precoBase: 52.00,  estado: 'MG' },
  { produto: 'Mandioca',        unidade: 'ton',       precoBase: 380.00, estado: 'PR' },
  { produto: 'Hortaliças',      unidade: 'kg',        precoBase: 3.20,   estado: 'SP' },
  { produto: 'Frutas',          unidade: 'caixa',     precoBase: 45.00,  estado: 'SP' },
  { produto: 'Uva',             unidade: 'kg',        precoBase: 6.80,   estado: 'RS' },
  { produto: 'Maçã',            unidade: 'cx 18kg',   precoBase: 42.00,  estado: 'RS' },
  { produto: 'Fumo',            unidade: 'kg',        precoBase: 25.00,  estado: 'RS' },
  { produto: 'Pastagem',        unidade: 'ha/mês',    precoBase: 180.00, estado: 'MT' },
  { produto: 'Silagem',         unidade: 'ton',       precoBase: 120.00, estado: 'PR' },
  { produto: 'Reflorestamento', unidade: 'm³',        precoBase: 85.00,  estado: 'SC' },
  // Animal
  { produto: 'Bovinos de corte',unidade: '@',         precoBase: 285.00, estado: 'SP' },
  { produto: 'Bovinos de leite',unidade: 'L',         precoBase: 2.45,   estado: 'MG' },
  { produto: 'Suínos',          unidade: 'kg',        precoBase: 7.80,   estado: 'SC' },
  { produto: 'Aves',            unidade: 'kg',        precoBase: 4.50,   estado: 'PR' },
  { produto: 'Ovinos',          unidade: '@',         precoBase: 180.00, estado: 'SP' },
  { produto: 'Caprinos',        unidade: 'kg',        precoBase: 18.00,  estado: 'BA' },
  { produto: 'Equinos',         unidade: 'cabeça',    precoBase: 4500.00,estado: 'SP' },
  { produto: 'Piscicultura',    unidade: 'kg',        precoBase: 9.50,   estado: 'PR' },
  { produto: 'Apicultura',      unidade: 'kg mel',    precoBase: 22.00,  estado: 'SP' },
];

// Monthly seasonal multipliers (index 0=Jan…11=Dec)
// Values > 1.0 = higher-than-average prices; < 1.0 = lower
const SEASONAL_FACTORS: Record<string, number[]> = {
  'Soja':             [1.00, 1.01, 1.04, 1.06, 1.05, 1.02, 0.99, 0.97, 0.96, 0.95, 0.96, 0.98],
  'Milho':            [1.06, 1.07, 1.03, 0.96, 0.94, 0.96, 0.98, 1.00, 1.02, 1.04, 1.05, 1.05],
  'Trigo':            [0.99, 0.99, 0.99, 1.00, 1.01, 1.05, 1.07, 1.06, 1.03, 0.96, 0.94, 0.97],
  'Café':             [0.97, 0.97, 0.98, 1.00, 1.05, 1.07, 1.07, 1.04, 0.99, 0.97, 0.97, 0.97],
  'Arroz':            [1.01, 1.02, 1.00, 0.96, 0.97, 1.02, 1.05, 1.06, 1.04, 1.02, 0.97, 0.96],
  'Feijão':           [1.04, 1.06, 1.02, 1.00, 0.97, 0.96, 0.97, 0.99, 1.02, 1.04, 1.03, 1.02],
  'Cana-de-açúcar':   [1.00, 0.99, 0.98, 0.99, 1.01, 1.03, 1.04, 1.03, 1.01, 1.00, 0.99, 0.99],
  'Algodão':          [0.99, 1.00, 1.01, 0.98, 0.96, 0.97, 0.99, 1.02, 1.04, 1.05, 1.04, 1.02],
  'Bovinos de corte': [1.02, 1.04, 1.05, 1.04, 1.02, 1.00, 0.97, 0.96, 0.98, 1.00, 1.01, 1.03],
  'Bovinos de leite': [1.01, 1.02, 1.02, 1.01, 0.99, 0.97, 0.97, 0.98, 1.00, 1.01, 1.01, 1.01],
  'Suínos':           [1.05, 1.04, 1.01, 0.98, 0.96, 0.97, 0.98, 1.00, 1.02, 1.03, 1.05, 1.06],
  'Aves':             [1.04, 1.03, 1.01, 0.98, 0.97, 0.98, 0.99, 1.00, 1.02, 1.03, 1.05, 1.05],
};

function getSeasonalFactor(produto: string, month: number): number {
  return SEASONAL_FACTORS[produto]?.[month] ?? 1.0;
}

function startOfDay(d = new Date()): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export interface PrecoComVariacao {
  id: string;
  produto: string;
  preco: number;
  unidade: string;
  estado: string | null;
  fonte: string | null;
  data: Date;
  variacaoPct: number;
}

export interface MonthlyPrice {
  month: number;
  monthName: string;
  preco: number | null;
  year: number;
}

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

/* ─── Static mock — used when DB is unavailable ─────────────────────────── */
function mockLatest(): PrecoComVariacao[] {
  const now = new Date();
  return COMMODITIES.map(({ produto, unidade, precoBase, estado }) => {
    const month = now.getMonth();
    const seasonal = getSeasonalFactor(produto, month);
    const noise = 1 + (Math.random() - 0.5) * 0.02;
    const preco = parseFloat((precoBase * seasonal * noise).toFixed(2));
    const variacaoPct = parseFloat(((Math.random() - 0.48) * 3).toFixed(2));
    return {
      id: `mock-${produto}`,
      produto,
      preco,
      unidade,
      estado,
      fonte: 'Mock/Demo',
      data: now,
      variacaoPct,
    };
  });
}

function mockHistoricoByYear(produto: string, year: number): MonthlyPrice[] {
  const comm = COMMODITIES.find((c) => c.produto.toLowerCase() === produto.toLowerCase());
  const precoBase = comm?.precoBase ?? 100;
  const totalMonths = (year - 2022) * 12 + 11;
  return MONTHS_PT.map((monthName, m) => {
    const offset = (year - 2022) * 12 + m;
    const trend = 0.70 + 0.30 * (offset / Math.max(1, totalMonths));
    const seasonal = getSeasonalFactor(produto, m);
    const noise = 1 + (Math.random() - 0.5) * 0.04;
    return {
      month: m + 1,
      monthName,
      preco: parseFloat((precoBase * trend * seasonal * noise).toFixed(2)),
      year,
    };
  });
}

export const precosService = {
  async getLatest(estado?: string): Promise<PrecoComVariacao[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const rows = await prisma.precoAgricola.findMany({
        where: {
          ...(estado ? { estado } : {}),
          data: { gte: thirtyDaysAgo },
        },
        orderBy: { data: 'desc' },
      });

      // If DB is empty (first boot not yet seeded), return mock immediately
      if (rows.length === 0) return mockLatest();

      const byProduct = new Map<string, typeof rows>();
      for (const row of rows) {
        if (!byProduct.has(row.produto)) byProduct.set(row.produto, []);
        byProduct.get(row.produto)!.push(row);
      }

      const result: PrecoComVariacao[] = [];
      for (const { produto } of COMMODITIES) {
        const prices = byProduct.get(produto);
        if (!prices?.length) continue;
        const current = prices[0];
        const previous = prices[1] ?? null;
        const variacaoPct =
          previous && previous.preco > 0
            ? parseFloat((((current.preco - previous.preco) / previous.preco) * 100).toFixed(2))
            : 0;
        result.push({ ...current, variacaoPct });
      }
      return result.length > 0 ? result : mockLatest();
    } catch (err) {
      logger.warn('[precos] getLatest falhou, usando mock:', err);
      return mockLatest();
    }
  },

  // Monthly averages for one year — used by the year-view chart
  async getHistoricoByYear(produto: string, year: number): Promise<MonthlyPrice[]> {
    try {
      const start = new Date(year, 0, 1);
      const end   = new Date(year + 1, 0, 1);

      const rows = await prisma.precoAgricola.findMany({
        where: {
          produto: { equals: produto, mode: 'insensitive' },
          data: { gte: start, lt: end },
        },
        orderBy: { data: 'asc' },
      });

      if (rows.length === 0) return mockHistoricoByYear(produto, year);

      const byMonth = new Map<number, number[]>();
      for (const row of rows) {
        const m = new Date(row.data).getMonth();
        if (!byMonth.has(m)) byMonth.set(m, []);
        byMonth.get(m)!.push(row.preco);
      }

      return Array.from({ length: 12 }, (_, m) => {
        const prices = byMonth.get(m) ?? [];
        const avg = prices.length
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : null;
        return {
          month: m + 1,
          monthName: MONTHS_PT[m],
          preco: avg !== null ? parseFloat(avg.toFixed(2)) : null,
          year,
        };
      });
    } catch (err) {
      logger.warn('[precos] getHistoricoByYear falhou, usando mock:', err);
      return mockHistoricoByYear(produto, year);
    }
  },

  // Legacy 30-day detail — kept for the dashboard sparkline
  async getHistorico(produto: string, estado?: string) {
    return prisma.precoAgricola.findMany({
      where: {
        produto: { equals: produto, mode: 'insensitive' },
        ...(estado ? { estado } : {}),
      },
      orderBy: { data: 'asc' },
      take: 30,
      select: { id: true, produto: true, preco: true, unidade: true, estado: true, fonte: true, data: true },
    });
  },

  async list(estado?: string) {
    return prisma.precoAgricola.findMany({
      where: estado ? { estado } : undefined,
      orderBy: { data: 'desc' },
      take: 100,
    });
  },

  // Seeds today's prices with ±1.5% random walk from previous record
  async seedDailyPrices(): Promise<void> {
    const today    = startOfDay();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const recent = await prisma.precoAgricola.findMany({
      where: { data: { lt: today } },
      orderBy: { data: 'desc' },
    });

    const prevMap = new Map<string, number>();
    for (const row of recent) {
      const key = `${row.produto}:${row.estado ?? ''}`;
      if (!prevMap.has(key)) prevMap.set(key, row.preco);
    }

    for (const { produto, unidade, precoBase, estado } of COMMODITIES) {
      const exists = await prisma.precoAgricola.findFirst({
        where: { produto, estado, data: { gte: today, lt: tomorrow } },
      });
      if (exists) continue;

      const base   = prevMap.get(`${produto}:${estado}`) ?? precoBase;
      const factor = 1 + (Math.random() - 0.5) * 0.03;
      const preco  = parseFloat((base * factor).toFixed(2));

      await prisma.precoAgricola.create({
        data: { produto, preco, unidade, estado, fonte: 'CEPEA/Simulado', data: new Date() },
      });
      logger.debug(`[precos] Seeded ${produto}: R$ ${preco}`);
    }
  },

  // Kept for backward compat — delegates to seedYearlyHistory on first boot
  async seedHistoricalPrices(): Promise<void> {
    const count = await prisma.precoAgricola.count();
    if (count === 0) await this.seedYearlyHistory();
  },

  // Seeds one record per month per commodity from Jan/2022 to last month.
  // Uses createMany (batch) — 27 bulk inserts instead of 1,400+ individual queries.
  async seedYearlyHistory(): Promise<void> {
    // Remove legacy product names that no longer match shared constants
    const legacyNames = ['Café Arábica', 'Boi Gordo', 'Leite'];
    const { count: removed } = await prisma.precoAgricola.deleteMany({
      where: { produto: { in: legacyNames } },
    });
    if (removed > 0) logger.info(`[precos] Removidos ${removed} registros legados`);

    // Guard: skip if we already have substantial monthly history (>= 27 commodities × ~10 months)
    const startOf2022 = new Date(2022, 0, 1);
    const existing = await prisma.precoAgricola.count({ where: { data: { gte: startOf2022 } } });
    if (existing >= 270) {
      logger.debug(`[precos] Histórico anual já existe (${existing} registros), ignorando seed`);
      return;
    }

    logger.info('[precos] Semeando histórico mensal desde Jan/2022 (batch)...');

    const now          = new Date();
    const currentYear  = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const totalMonths  = (currentYear - 2022) * 12 + currentMonth;

    for (const { produto, unidade, precoBase, estado } of COMMODITIES) {
      // Build all month records for this commodity in memory
      const records: {
        produto: string; preco: number; unidade: string;
        estado: string; fonte: string; data: Date;
      }[] = [];

      for (let offset = 0; offset < totalMonths; offset++) {
        const year  = 2022 + Math.floor(offset / 12);
        const month = offset % 12;

        const trendFactor = 0.70 + 0.30 * (offset / Math.max(1, totalMonths - 1));
        const seasonal    = getSeasonalFactor(produto, month);
        const noise       = 1 + (Math.random() - 0.5) * 0.04;
        const preco       = parseFloat((precoBase * trendFactor * seasonal * noise).toFixed(2));

        records.push({
          produto, preco, unidade, estado,
          fonte: 'CEPEA/Simulado',
          data: new Date(year, month, 15),
        });
      }

      // Single batch insert per commodity — replaces ~52 individual queries
      await prisma.precoAgricola.createMany({ data: records });
      logger.debug(`[precos] ${produto}: ${records.length} meses semeados`);
    }

    logger.info(`[precos] Histórico semeado — ${COMMODITIES.length} commodities × ${totalMonths} meses`);
  },
};
