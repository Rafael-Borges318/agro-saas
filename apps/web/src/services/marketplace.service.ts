import { api } from './api';

export const marketplaceService = {
  list: () => api.get('/marketplace'),
  findById: (id: string) => api.get(`/marketplace/${id}`),
  create: (data: object) => api.post('/marketplace', data),
  update: (id: string, data: object) => api.patch(`/marketplace/${id}`, data),
  remove: (id: string) => api.delete(`/marketplace/${id}`),
};
