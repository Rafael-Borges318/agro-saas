import { create } from 'zustand';

interface ClimaData {
  cidade: string;
  temperatura: number | null;
  descricao: string;
  umidade: number | null;
}

interface ClimaState {
  data: ClimaData | null;
  loading: boolean;
  error: string | null;
  cidade: string;
  setCidade: (cidade: string) => void;
  setData: (data: ClimaData) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useClimaStore = create<ClimaState>((set) => ({
  data: null,
  loading: false,
  error: null,
  cidade: 'São Paulo',
  setCidade: (cidade) => set({ cidade }),
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
