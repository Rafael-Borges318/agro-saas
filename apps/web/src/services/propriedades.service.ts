import { api } from './api';
import type { ApiResponse, Propriedade } from '../types';

export const propriedadesService = {
  list: () =>
    api.get<ApiResponse<Propriedade[]>>('/propriedades').then((r) => r.data.data),
};
