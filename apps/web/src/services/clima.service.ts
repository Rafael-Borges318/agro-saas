import { api } from './api';
import type { ApiResponse, CurrentWeather, ForecastDay } from '../types';

type ClimaQuery = { cidade: string } | { lat: number; lon: number };

/* ─── Mock fallback (shown when API is offline / key not set) ─────────────── */
const MOCK_CURRENT: CurrentWeather = {
  cidade: 'Torres',
  temperatura: 23,
  sensacao: 21,
  umidade: 70,
  chuva: false,
  vento: 16,
  descricao: 'parcialmente nublado',
  icone: '02d',
  lat: -29.33,
  lon: -49.73,
};

const today = new Date();
const MOCK_FORECAST: ForecastDay[] = [
  { data: fmtDate(0), tempMin: 17, tempMax: 24, descricao: 'céu limpo',           icone: '01d', chuva: false, precipitacaoMm: 0 },
  { data: fmtDate(1), tempMin: 16, tempMax: 23, descricao: 'parcialmente nublado', icone: '02d', chuva: false, precipitacaoMm: 0 },
  { data: fmtDate(2), tempMin: 15, tempMax: 21, descricao: 'nublado',              icone: '03d', chuva: false, precipitacaoMm: 0 },
  { data: fmtDate(3), tempMin: 14, tempMax: 19, descricao: 'chuva fraca',          icone: '10d', chuva: true,  precipitacaoMm: 4.2 },
  { data: fmtDate(4), tempMin: 16, tempMax: 22, descricao: 'céu limpo',            icone: '01d', chuva: false, precipitacaoMm: 0 },
];

function fmtDate(daysAhead: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function wrapMock<T>(data: T): ApiResponse<T> {
  return { status: 'success', data };
}

export const climaService = {
  getCurrent: async (q: ClimaQuery): Promise<ApiResponse<CurrentWeather>> => {
    try {
      const res = await api.get<ApiResponse<CurrentWeather>>('/clima', { params: q });
      return res.data;
    } catch {
      return wrapMock(MOCK_CURRENT);
    }
  },

  getForecast: async (q: ClimaQuery): Promise<ApiResponse<ForecastDay[]>> => {
    try {
      const res = await api.get<ApiResponse<ForecastDay[]>>('/clima/forecast', { params: q });
      return res.data;
    } catch {
      return wrapMock(MOCK_FORECAST);
    }
  },
};
