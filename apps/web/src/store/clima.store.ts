import { create } from 'zustand';
import type { CurrentWeather, ForecastDay } from '../types';

interface ClimaState {
  current: CurrentWeather | null;
  forecast: ForecastDay[];
  loading: boolean;
  error: string | null;
  cidade: string;
  setCidade: (cidade: string) => void;
  setCurrent: (data: CurrentWeather) => void;
  setForecast: (data: ForecastDay[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useClimaStore = create<ClimaState>((set) => ({
  current: null,
  forecast: [],
  loading: false,
  error: null,
  cidade: 'Torres',
  setCidade: (cidade) => set({ cidade }),
  setCurrent: (current) => set({ current, error: null }),
  setForecast: (forecast) => set({ forecast }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
