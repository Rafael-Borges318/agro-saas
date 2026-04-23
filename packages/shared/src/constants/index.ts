export const APP_NAME = 'AgroSaaS';
export const APP_VERSION = '1.0.0';

export const API_PREFIX = '/api/v1';

export const ROLES = {
  PRODUTOR: 'PRODUTOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const PLAN_NAMES = {
  FREE: 'Gratuito',
  BASICO: 'Básico',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
} as const;

export const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
] as const;

export const ESPECIES_ANIMAIS = [
  'BOVINO','SUINO','AVICOLA','OVINO','CAPRINO','EQUINO','OUTRO',
] as const;

export const CATEGORIAS_TRANSACAO = [
  'ALIMENTACAO','SAUDE_ANIMAL','INSUMOS','EQUIPAMENTOS',
  'COMBUSTIVEL','MAO_DE_OBRA','VENDA_ANIMAL','VENDA_PRODUCAO',
  'FINANCIAMENTO','OUTROS',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
