import { api } from './api';
import type { User } from '../types';
import type { TipoProducao, ProducaoVegetal, ProducaoAnimal, ObjetivoProdutor } from '@shared/constants';

export interface OnboardingData {
  // Step 1 — contact & location
  telefone?: string;
  estado: string;
  cidade: string;
  // Step 2 — property
  nomePropriedade: string;
  municipio: string;
  areaHectares: number;
  // Step 2 — production profile
  tipoProducao?: TipoProducao;
  producoesVegetais?: ProducaoVegetal[];
  producoesAnimais?: ProducaoAnimal[];
  objetivoPrincipal?: ObjetivoProdutor;
}

export const onboardingService = {
  complete: (data: OnboardingData) =>
    api.post<{ data: User }>('/onboarding', data),
};
