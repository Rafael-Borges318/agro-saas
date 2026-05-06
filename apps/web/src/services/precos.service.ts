import { api } from './api';
import { cache, TTL } from './cache';
import type { ApiResponse, PrecoAgricola } from '../types';

export interface MonthlyPrice {
  month: number;
  monthName: string;
  preco: number | null;
  year: number;
}

/* ─── Mock fallback (shown when API is offline / DB not seeded) ──────────── */
const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const MOCK_COMMODITIES = [
  { produto: 'Soja',            unidade: 'sc 60kg',  preco: 143.20, estado: 'PR', variacao:  1.4 },
  { produto: 'Milho',           unidade: 'sc 60kg',  preco:  69.50, estado: 'PR', variacao: -0.8 },
  { produto: 'Arroz',           unidade: 'sc 50kg',  preco:  83.00, estado: 'RS', variacao:  0.3 },
  { produto: 'Trigo',           unidade: 'sc 60kg',  preco:  96.10, estado: 'PR', variacao: -1.2 },
  { produto: 'Feijão',          unidade: 'sc 60kg',  preco: 217.50, estado: 'PR', variacao:  2.1 },
  { produto: 'Café',            unidade: 'sc 60kg',  preco: 895.00, estado: 'SP', variacao:  0.6 },
  { produto: 'Algodão',         unidade: '@',        preco: 146.30, estado: 'MT', variacao: -0.4 },
  { produto: 'Cana-de-açúcar',  unidade: 'ton',      preco:  38.80, estado: 'SP', variacao:  0.8 },
  { produto: 'Sorgo',           unidade: 'sc 60kg',  preco:  52.40, estado: 'MG', variacao: -1.5 },
  { produto: 'Mandioca',        unidade: 'ton',      preco: 382.00, estado: 'PR', variacao:  0.5 },
  { produto: 'Hortaliças',      unidade: 'kg',       preco:   3.25, estado: 'SP', variacao:  1.6 },
  { produto: 'Frutas',          unidade: 'caixa',    preco:  45.50, estado: 'SP', variacao: -0.3 },
  { produto: 'Uva',             unidade: 'kg',       preco:   6.90, estado: 'RS', variacao:  1.5 },
  { produto: 'Maçã',            unidade: 'cx 18kg',  preco:  42.50, estado: 'RS', variacao: -0.7 },
  { produto: 'Fumo',            unidade: 'kg',       preco:  25.30, estado: 'RS', variacao:  1.2 },
  { produto: 'Pastagem',        unidade: 'ha/mês',   preco: 182.00, estado: 'MT', variacao:  0.9 },
  { produto: 'Silagem',         unidade: 'ton',      preco: 121.50, estado: 'PR', variacao: -0.5 },
  { produto: 'Reflorestamento', unidade: 'm³',       preco:  85.80, estado: 'SC', variacao:  0.4 },
  { produto: 'Bovinos de corte',unidade: '@',        preco: 287.00, estado: 'SP', variacao:  1.8 },
  { produto: 'Bovinos de leite',unidade: 'L',        preco:   2.48, estado: 'MG', variacao: -0.4 },
  { produto: 'Suínos',          unidade: 'kg',       preco:   7.85, estado: 'SC', variacao:  0.6 },
  { produto: 'Aves',            unidade: 'kg',       preco:   4.55, estado: 'PR', variacao: -1.1 },
  { produto: 'Ovinos',          unidade: '@',        preco: 181.50, estado: 'SP', variacao:  0.8 },
  { produto: 'Caprinos',        unidade: 'kg',       preco:  18.20, estado: 'BA', variacao:  1.3 },
  { produto: 'Equinos',         unidade: 'cabeça',   preco: 4550.0, estado: 'SP', variacao:  0.2 },
  { produto: 'Piscicultura',    unidade: 'kg',       preco:   9.60, estado: 'PR', variacao:  1.1 },
  { produto: 'Apicultura',      unidade: 'kg mel',   preco:  22.30, estado: 'SP', variacao:  0.7 },
];

function mockLatestResponse(): ApiResponse<PrecoAgricola[]> {
  const now = new Date().toISOString();
  return {
    status: 'success',
    data: MOCK_COMMODITIES.map((c, i) => ({
      id: `mock-${i}`,
      produto: c.produto,
      preco: c.preco,
      unidade: c.unidade,
      estado: c.estado,
      fonte: 'Demo',
      data: now,
      variacaoPct: c.variacao,
    })),
  };
}

function mockHistoricoResponse(produto: string, year: number): ApiResponse<MonthlyPrice[]> {
  const base = MOCK_COMMODITIES.find(
    (c) => c.produto.toLowerCase() === produto.toLowerCase(),
  )?.preco ?? 100;
  const totalMonths = (year - 2022) * 12 + 11;
  return {
    status: 'success',
    data: MONTHS_PT.map((monthName, m) => {
      const offset = (year - 2022) * 12 + m;
      const trend  = 0.70 + 0.30 * (offset / Math.max(1, totalMonths));
      // Deterministic seasonal noise based on month (no Math.random so chart is stable on re-render)
      const seasonal = 1 + Math.sin((m / 11) * Math.PI * 2) * 0.04;
      return {
        month: m + 1,
        monthName,
        preco: parseFloat((base * trend * seasonal).toFixed(2)),
        year,
      };
    }),
  };
}

export const precosService = {
  getLatest: async (estado?: string): Promise<ApiResponse<PrecoAgricola[]>> => {
    const key = `precos:latest:${estado ?? 'all'}`;
    const cached = cache.get<ApiResponse<PrecoAgricola[]>>(key);
    if (cached) return cached;

    try {
      const res = await api.get<ApiResponse<PrecoAgricola[]>>('/precos/latest', {
        params: estado ? { estado } : undefined,
      });
      const data = res.data;
      if (Array.isArray(data.data) && data.data.length === 0) return mockLatestResponse();
      cache.set(key, data, TTL.PRICES);
      return data;
    } catch {
      return mockLatestResponse();
    }
  },

  getHistorico: async (produto: string, estado?: string): Promise<ApiResponse<PrecoAgricola[]>> => {
    try {
      const res = await api.get<ApiResponse<PrecoAgricola[]>>(
        `/precos/${encodeURIComponent(produto)}`,
        { params: estado ? { estado } : undefined },
      );
      return res.data;
    } catch {
      return { status: 'success', data: [] };
    }
  },

  getHistoricoByYear: async (produto: string, year: number): Promise<ApiResponse<MonthlyPrice[]>> => {
    try {
      const res = await api.get<ApiResponse<MonthlyPrice[]>>(
        `/precos/historico/${encodeURIComponent(produto)}`,
        { params: { year } },
      );
      const data = res.data;
      if (Array.isArray(data.data) && data.data.filter((p) => p.preco !== null).length === 0) {
        return mockHistoricoResponse(produto, year);
      }
      return data;
    } catch {
      return mockHistoricoResponse(produto, year);
    }
  },
};
