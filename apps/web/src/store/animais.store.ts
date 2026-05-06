import { create } from 'zustand';
import type {
  Animal,
  AnimalStats,
  CreateAnimalData,
  CreateEventoData,
  ListAnimaisFilters,
} from '../types';
import { animaisService } from '../services/animais.service';

interface Filters extends ListAnimaisFilters {
  search: string;
}

interface LoadingState {
  stats: boolean;
  list: boolean;
  submitting: boolean;
  deleting: string | null;
  eventos: string | null; // animalId whose eventos are loading
  addingEvento: string | null;
}

interface AnimaisState {
  animais: Animal[];
  stats: AnimalStats | null;
  selectedAnimalId: string | null;
  filters: Filters;
  loading: LoadingState;
  error: string | null;
  successMessage: string | null;

  fetchStats: () => Promise<void>;
  fetchList: () => Promise<void>;
  fetchAll: () => Promise<void>;

  createAnimal: (data: CreateAnimalData) => Promise<void>;
  updateAnimal: (id: string, data: Partial<CreateAnimalData>) => Promise<void>;
  removeAnimal: (id: string) => Promise<void>;

  loadEventos: (animalId: string) => Promise<void>;
  addEvento: (animalId: string, data: CreateEventoData) => Promise<void>;

  selectAnimal: (id: string | null) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  clearMessages: () => void;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  orderBy: 'createdAt',
  order: 'desc',
};

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    if (r?.data?.message) return r.data.message;
  }
  return 'Ocorreu um erro. Tente novamente.';
}

export const useAnimaisStore = create<AnimaisState>((set, get) => ({
  animais: [],
  stats: null,
  selectedAnimalId: null,
  filters: DEFAULT_FILTERS,
  loading: { stats: false, list: false, submitting: false, deleting: null, eventos: null, addingEvento: null },
  error: null,
  successMessage: null,

  fetchStats: async () => {
    set((s) => ({ loading: { ...s.loading, stats: true }, error: null }));
    try {
      const data = await animaisService.stats();
      set((s) => ({ stats: data, loading: { ...s.loading, stats: false } }));
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, stats: false } }));
    }
  },

  fetchList: async () => {
    const { filters } = get();
    set((s) => ({ loading: { ...s.loading, list: true }, error: null }));
    try {
      const f: ListAnimaisFilters = {
        orderBy: filters.orderBy,
        order: filters.order,
        ...(filters.especie ? { especie: filters.especie } : {}),
        ...(filters.status  ? { status:  filters.status  } : {}),
        ...(filters.search  ? { search:  filters.search  } : {}),
      };
      const data = await animaisService.list(f);
      set((s) => ({ animais: data, loading: { ...s.loading, list: false } }));
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, list: false } }));
    }
  },

  fetchAll: async () => {
    const { fetchStats, fetchList } = get();
    await Promise.all([fetchStats(), fetchList()]);
  },

  createAnimal: async (data) => {
    set((s) => ({ loading: { ...s.loading, submitting: true }, error: null }));
    try {
      const animal = await animaisService.create(data);
      set((s) => ({
        animais: [animal, ...s.animais],
        loading: { ...s.loading, submitting: false },
        successMessage: 'Animal cadastrado com sucesso!',
      }));
      get().fetchStats();
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, submitting: false } }));
    }
  },

  updateAnimal: async (id, data) => {
    set((s) => ({ loading: { ...s.loading, submitting: true }, error: null }));
    try {
      const updated = await animaisService.update(id, data);
      set((s) => ({
        animais: s.animais.map((a) => (a.id === id ? { ...a, ...updated } : a)),
        loading: { ...s.loading, submitting: false },
        successMessage: 'Animal atualizado com sucesso!',
      }));
      get().fetchStats();
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, submitting: false } }));
    }
  },

  removeAnimal: async (id) => {
    set((s) => ({ loading: { ...s.loading, deleting: id }, error: null }));
    try {
      await animaisService.remove(id);
      set((s) => ({
        animais: s.animais.filter((a) => a.id !== id),
        selectedAnimalId: s.selectedAnimalId === id ? null : s.selectedAnimalId,
        loading: { ...s.loading, deleting: null },
        successMessage: 'Animal removido.',
      }));
      get().fetchStats();
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, deleting: null } }));
    }
  },

  loadEventos: async (animalId) => {
    set((s) => ({ loading: { ...s.loading, eventos: animalId } }));
    try {
      const eventos = await animaisService.listEventos(animalId);
      set((s) => ({
        animais: s.animais.map((a) => (a.id === animalId ? { ...a, eventos } : a)),
        loading: { ...s.loading, eventos: null },
      }));
    } catch {
      set((s) => ({ loading: { ...s.loading, eventos: null } }));
    }
  },

  addEvento: async (animalId, data) => {
    set((s) => ({ loading: { ...s.loading, addingEvento: animalId }, error: null }));
    try {
      const evento = await animaisService.createEvento(animalId, data);
      set((s) => ({
        animais: s.animais.map((a) =>
          a.id === animalId
            ? { ...a, eventos: [evento, ...(a.eventos ?? [])] }
            : a,
        ),
        loading: { ...s.loading, addingEvento: null },
        successMessage: 'Evento registrado com sucesso!',
      }));
      // Re-fetch list to pick up updated pesoKg / status
      get().fetchList();
      get().fetchStats();
    } catch (err) {
      set((s) => ({ error: extractError(err), loading: { ...s.loading, addingEvento: null } }));
    }
  },

  selectAnimal: (id) => set({ selectedAnimalId: id }),

  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  clearMessages: () => set({ error: null, successMessage: null }),
}));
