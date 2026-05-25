import { api } from './api';
import type {
  MarketplaceProduct,
  MarketplaceFilters,
  MarketplaceListResult,
  MarketplacePublicStats,
  MarketplaceCategoryCount,
  MarketplaceMyStats,
  CreateMarketplaceData,
  UpdateMarketplaceData,
} from '../types';

export const marketplaceService = {
  list: (filters?: MarketplaceFilters): Promise<MarketplaceListResult> =>
    api.get('/marketplace', { params: filters }).then((r) => r.data),

  featured: (): Promise<MarketplaceProduct[]> =>
    api.get('/marketplace/featured').then((r) => r.data.data),

  recent: (): Promise<MarketplaceProduct[]> =>
    api.get('/marketplace/recent').then((r) => r.data.data),

  publicStats: (): Promise<MarketplacePublicStats> =>
    api.get('/marketplace/stats').then((r) => r.data.data),

  categoryCounts: (): Promise<MarketplaceCategoryCount[]> =>
    api.get('/marketplace/categorias').then((r) => r.data.data),

  findById: (id: string): Promise<MarketplaceProduct> =>
    api.get(`/marketplace/${id}`).then((r) => r.data.data),

  create: (data: CreateMarketplaceData): Promise<MarketplaceProduct> =>
    api.post('/marketplace', data).then((r) => r.data.data),

  update: (id: string, data: UpdateMarketplaceData): Promise<MarketplaceProduct> =>
    api.patch(`/marketplace/${id}`, data).then((r) => r.data.data),

  updateStatus: (id: string, status: string): Promise<MarketplaceProduct> =>
    api.patch(`/marketplace/${id}/status`, { status }).then((r) => r.data.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/marketplace/${id}`).then(() => undefined),

  toggleFavorito: (id: string): Promise<{ favorito: boolean }> =>
    api.post(`/marketplace/${id}/favorito`).then((r) => r.data.data),

  myFavorites: (): Promise<MarketplaceProduct[]> =>
    api.get('/marketplace/favoritos').then((r) => r.data.data),

  myListings: (): Promise<MarketplaceProduct[]> =>
    api.get('/marketplace/meus').then((r) => r.data.data),

  myStats: (): Promise<MarketplaceMyStats> =>
    api.get('/marketplace/meus/stats').then((r) => r.data.data),

  trackContact: (id: string, tipo: string): Promise<void> =>
    api.post(`/marketplace/${id}/contato`, { tipo }).then(() => undefined),
};
