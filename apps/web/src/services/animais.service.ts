import { api } from './api';
import { cache } from './cache';
import type {
  Animal,
  AnimalEvento,
  AnimalStats,
  ApiResponse,
  CreateAnimalData,
  CreateEventoData,
  ListAnimaisFilters,
} from '../types';

const TTL_STATS = 30 * 1000;

export const animaisService = {
  stats: () =>
    cache.dedupe('animais:stats', () =>
      api.get<ApiResponse<AnimalStats>>('/animais/stats').then((r) => r.data.data),
      TTL_STATS,
    ),

  list: (filters: ListAnimaisFilters = {}) => {
    const params: Record<string, string> = {};
    if (filters.especie)  params.especie  = filters.especie;
    if (filters.status)   params.status   = filters.status;
    if (filters.search)   params.search   = filters.search;
    if (filters.orderBy)  params.orderBy  = filters.orderBy;
    if (filters.order)    params.order    = filters.order;
    return api.get<ApiResponse<Animal[]>>('/animais', { params }).then((r) => r.data.data);
  },

  findById: (id: string) =>
    api.get<ApiResponse<Animal>>(`/animais/${id}`).then((r) => r.data.data),

  create: (data: CreateAnimalData) => {
    cache.delete('animais:stats');
    return api.post<ApiResponse<Animal>>('/animais', data).then((r) => r.data.data);
  },

  update: (id: string, data: Partial<CreateAnimalData>) => {
    cache.delete('animais:stats');
    return api.patch<ApiResponse<Animal>>(`/animais/${id}`, data).then((r) => r.data.data);
  },

  remove: (id: string) => {
    cache.delete('animais:stats');
    return api.delete(`/animais/${id}`);
  },

  listEventos: (animalId: string) =>
    api.get<ApiResponse<AnimalEvento[]>>(`/animais/${animalId}/eventos`).then((r) => r.data.data),

  createEvento: (animalId: string, data: CreateEventoData) => {
    cache.delete('animais:stats');
    return api
      .post<ApiResponse<AnimalEvento>>(`/animais/${animalId}/eventos`, data)
      .then((r) => r.data.data);
  },
};
