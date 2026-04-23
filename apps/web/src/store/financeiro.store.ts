import { create } from 'zustand';

interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

interface FinanceiroState {
  resumo: ResumoFinanceiro | null;
  loading: boolean;
  error: string | null;
  setResumo: (data: ResumoFinanceiro) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useFinanceiroStore = create<FinanceiroState>((set) => ({
  resumo: null,
  loading: false,
  error: null,
  setResumo: (resumo) => set({ resumo, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
