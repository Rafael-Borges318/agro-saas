import { create } from 'zustand';
import type { CurrentWeather, ForecastDay } from '../types';

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem('clima_favorites') ?? '[]') as string[];
  } catch {
    return [];
  }
}

function loadLastCity(): string {
  return localStorage.getItem('clima_last_city') ?? 'Torres';
}

interface ClimaState {
  current: CurrentWeather | null;
  forecast: ForecastDay[];
  loading: boolean;
  error: string | null;
  cidade: string;
  favorites: string[];
  selectedDayIndex: number;
  setCidade: (cidade: string) => void;
  setCurrent: (data: CurrentWeather) => void;
  setForecast: (data: ForecastDay[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  addFavorite: (cidade: string) => void;
  removeFavorite: (cidade: string) => void;
  setSelectedDayIndex: (index: number) => void;
}

export const useClimaStore = create<ClimaState>((set, get) => ({
  current: null,
  forecast: [],
  loading: false,
  error: null,
  cidade: loadLastCity(),
  favorites: loadFavorites(),
  selectedDayIndex: 0,

  setCidade: (cidade) => {
    localStorage.setItem('clima_last_city', cidade);
    set({ cidade });
  },
  setCurrent: (current) => set({ current, error: null }),
  setForecast: (forecast) => set({ forecast }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),

  addFavorite: (cidade) => {
    const favs = [...new Set([...get().favorites, cidade])];
    localStorage.setItem('clima_favorites', JSON.stringify(favs));
    set({ favorites: favs });
  },

  removeFavorite: (cidade) => {
    const favs = get().favorites.filter((f) => f !== cidade);
    localStorage.setItem('clima_favorites', JSON.stringify(favs));
    set({ favorites: favs });
  },

  setSelectedDayIndex: (selectedDayIndex) => set({ selectedDayIndex }),
}));
