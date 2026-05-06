import { create } from 'zustand';
import type { CurrentWeather, ForecastDay, CityFavorite } from '../types';

const FAVS_KEY = 'clima_favorites_v2';

function loadFavorites(): CityFavorite[] {
  try {
    const raw = localStorage.getItem(FAVS_KEY);
    if (raw) return JSON.parse(raw) as CityFavorite[];
    // Migrate old string-only favorites — we can't recover coordinates, so discard
    localStorage.removeItem('clima_favorites');
    return [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: CityFavorite[]) {
  localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
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
  favorites: CityFavorite[];
  selectedDayIndex: number;
  setCidade: (cidade: string) => void;
  setCurrent: (data: CurrentWeather) => void;
  setForecast: (data: ForecastDay[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  addFavorite: (city: CityFavorite) => void;
  removeFavorite: (name: string) => void;
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

  addFavorite: (city) => {
    const existing = get().favorites;
    if (existing.some(f => f.name === city.name)) return;
    const favs = [...existing, city];
    saveFavorites(favs);
    set({ favorites: favs });
  },

  removeFavorite: (name) => {
    const favs = get().favorites.filter(f => f.name !== name);
    saveFavorites(favs);
    set({ favorites: favs });
  },

  setSelectedDayIndex: (selectedDayIndex) => set({ selectedDayIndex }),
}));
