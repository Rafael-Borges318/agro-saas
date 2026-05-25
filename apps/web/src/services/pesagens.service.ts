import { api } from './api';
import type { ApiResponse, CreatePesagemData, Pesagem } from '../types';

export const pesagensService = {
  list: (animalId: string) =>
    api.get<ApiResponse<Pesagem[]>>(`/animais/${animalId}/pesagens`).then((r) => r.data.data),

  create: (animalId: string, data: CreatePesagemData) =>
    api.post<ApiResponse<Pesagem>>(`/animais/${animalId}/pesagens`, data).then((r) => r.data.data),

  remove: (animalId: string, pesId: string) =>
    api.delete(`/animais/${animalId}/pesagens/${pesId}`),
};
