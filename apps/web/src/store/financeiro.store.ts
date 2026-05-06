import { create } from 'zustand';
import type {
  CreateTransacaoData,
  GraficoMes,
  ResumoFinanceiro,
  Transacao,
  TransacaoCategoria,
  TransacaoTipo,
} from '../types';
import { financeiroService } from '../services/financeiro.service';

interface Filters {
  mes: string;           // 'YYYY-MM' or '' for all
  tipo: TransacaoTipo | 'todos';
  categoria: TransacaoCategoria | '';
}

interface LoadingState {
  resumo: boolean;
  transacoes: boolean;
  grafico: boolean;
  submitting: boolean;
  deleting: string | null; // id being deleted
}

interface FinanceiroState {
  transacoes: Transacao[];
  resumo: ResumoFinanceiro | null;
  grafico: GraficoMes[];
  filters: Filters;
  loading: LoadingState;
  error: string | null;
  successMessage: string | null;

  fetchResumo: () => Promise<void>;
  fetchTransacoes: () => Promise<void>;
  fetchGrafico: () => Promise<void>;
  fetchAll: () => Promise<void>;
  addTransacao: (data: CreateTransacaoData) => Promise<void>;
  removeTransacao: (id: string, tipo: TransacaoTipo) => Promise<void>;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  clearMessages: () => void;
}

const DEFAULT_FILTERS: Filters = {
  mes: new Date().toISOString().slice(0, 7), // current month
  tipo: 'todos',
  categoria: '',
};

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { status?: number; data?: { message?: string } } }).response;
    if (r?.status === 429) return 'Limite de requisições atingido. Aguarde alguns instantes e tente novamente.';
    if (r?.data?.message) return r.data.message;
  }
  return 'Ocorreu um erro. Tente novamente.';
}

export const useFinanceiroStore = create<FinanceiroState>((set, get) => ({
  transacoes: [],
  resumo: null,
  grafico: [],
  filters: DEFAULT_FILTERS,
  loading: { resumo: false, transacoes: false, grafico: false, submitting: false, deleting: null },
  error: null,
  successMessage: null,

  fetchResumo: async () => {
    set((s) => ({ loading: { ...s.loading, resumo: true }, error: null }));
    try {
      const res = await financeiroService.resumo();
      set((s) => ({ resumo: res.data.data, loading: { ...s.loading, resumo: false } }));
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, resumo: false } }));
    }
  },

  fetchTransacoes: async () => {
    const { filters } = get();
    set((s) => ({ loading: { ...s.loading, transacoes: true }, error: null }));
    try {
      const res = await financeiroService.listTransacoes({
        mes: filters.mes || undefined,
        tipo: filters.tipo,
        categoria: (filters.categoria as TransacaoCategoria) || undefined,
      });
      set((s) => ({ transacoes: res.data.data, loading: { ...s.loading, transacoes: false } }));
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, transacoes: false } }));
    }
  },

  fetchGrafico: async () => {
    set((s) => ({ loading: { ...s.loading, grafico: true } }));
    try {
      const res = await financeiroService.grafico();
      set((s) => ({ grafico: res.data.data, loading: { ...s.loading, grafico: false } }));
    } catch {
      set((s) => ({ loading: { ...s.loading, grafico: false } }));
    }
  },

  fetchAll: async () => {
    const { fetchResumo, fetchTransacoes, fetchGrafico } = get();
    await Promise.all([fetchResumo(), fetchTransacoes(), fetchGrafico()]);
  },

  addTransacao: async (data) => {
    set((s) => ({ loading: { ...s.loading, submitting: true }, error: null }));
    try {
      await financeiroService.createTransacao(data);
      // Refresh all data after successful creation
      const { fetchResumo, fetchTransacoes, fetchGrafico } = get();
      await Promise.all([fetchResumo(), fetchTransacoes(), fetchGrafico()]);
      set((s) => ({
        successMessage: `${data.tipo === 'receita' ? 'Receita' : 'Despesa'} registrada com sucesso!`,
        loading: { ...s.loading, submitting: false },
      }));
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, submitting: false } }));
    }
  },

  removeTransacao: async (id, tipo) => {
    set((s) => ({ loading: { ...s.loading, deleting: id }, error: null }));
    try {
      await financeiroService.deleteTransacao(id, tipo);
      // Optimistic removal from list + refresh summary
      set((s) => ({
        transacoes: s.transacoes.filter((t) => t.id !== id),
        loading: { ...s.loading, deleting: null },
        successMessage: 'Transação excluída.',
      }));
      // Refresh summary and chart
      const { fetchResumo, fetchGrafico } = get();
      await Promise.all([fetchResumo(), fetchGrafico()]);
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, deleting: null } }));
    }
  },

  setFilter: (key, value) => {
    set((s) => ({ filters: { ...s.filters, [key]: value } }));
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  clearMessages: () => {
    set({ error: null, successMessage: null });
  },
}));
