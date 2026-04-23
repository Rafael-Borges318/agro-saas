import { api } from './api';

export const precosService = {
  list: () => api.get('/precos'),
  getByProduto: (produto: string) => api.get(`/precos/${produto}`),
};
