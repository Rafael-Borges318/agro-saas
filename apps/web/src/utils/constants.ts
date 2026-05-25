export const APP_NAME = 'Agro Controle';
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/cadastro',
  ONBOARDING: '/onboarding',
  PLANOS: '/planos',
  DASHBOARD: '/dashboard',
  CLIMA: '/clima',
  PRECOS: '/precos',
  FINANCEIRO: '/financeiro',
  ANIMAIS: '/animais',
  RELATORIOS: '/relatorios',
  ADMIN: '/admin',
} as const;

export const TOKEN_KEY = '@agro-saas:token';
export const USER_KEY = '@agro-saas:user';
