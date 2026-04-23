import { api } from './api';

export const financeiroService = {
  resumo: (propriedadeId: string) => api.get('/financeiro/resumo', { params: { propriedadeId } }),
  listDespesas: (propriedadeId: string) => api.get('/financeiro/despesas', { params: { propriedadeId } }),
  createDespesa: (data: object) => api.post('/financeiro/despesas', data),
  listReceitas: (propriedadeId: string) => api.get('/financeiro/receitas', { params: { propriedadeId } }),
  createReceita: (data: object) => api.post('/financeiro/receitas', data),
};
