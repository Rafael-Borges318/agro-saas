export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  status: 'error' | 'validation_error';
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PRODUTOR' | 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl?: string;
  onboardingCompleted: boolean;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface Plan {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  features: string[];
  limitePropriedades: number;
  limiteAnimais: number;
  status: 'ATIVO' | 'INATIVO' | 'ARQUIVADO';
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

export interface CurrentWeather {
  cidade: string;
  temperatura: number;
  sensacao: number;
  umidade: number;
  chuva: boolean;
  vento: number;
  descricao: string;
  icone: string;
  lat: number;
  lon: number;
}

export interface ForecastDay {
  data: string;
  tempMin: number;
  tempMax: number;
  descricao: string;
  icone: string;
  chuva: boolean;
  precipitacaoMm: number;
}

export interface PrecoAgricola {
  id: string;
  produto: string;
  preco: number;
  unidade: string;
  estado: string | null;
  fonte: string | null;
  data: string;
  variacaoPct: number;
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'INFO' | 'ALERTA' | 'URGENTE' | 'SISTEMA';
  lida: boolean;
  criadoEm: string;
}
