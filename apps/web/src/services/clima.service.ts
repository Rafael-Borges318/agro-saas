import { api } from './api';

export const climaService = {
  getCurrent: (cidade: string) => api.get('/clima', { params: { cidade } }),
  getForecast: (cidade: string) => api.get('/clima/forecast', { params: { cidade } }),
};
