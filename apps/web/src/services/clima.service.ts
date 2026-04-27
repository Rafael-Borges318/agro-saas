import { api } from './api';
import type { ApiResponse, CityResult, CurrentWeather, ForecastDay } from '../types';

type ClimaQuery = { cidade: string } | { lat: number; lon: number };

/* ─── Mock fallback (shown when API is offline / key not set) ─────────────── */
const MOCK_CURRENT: CurrentWeather = {
  cidade: 'Torres',
  temperatura: 23,
  sensacao: 21,
  umidade: 70,
  chuva: false,
  chuvaAmm: 0,
  vento: 16,
  descricao: 'parcialmente nublado',
  icone: '02d',
  lat: -29.33,
  lon: -49.73,
};

const today = new Date();
const MOCK_FORECAST: ForecastDay[] = [
  { data: fmtDate(0), tempMin: 17, tempMax: 24, descricao: 'céu limpo',           icone: '01d', chuva: false, precipitacaoMm: 0,   chanceDeChuva: 5  },
  { data: fmtDate(1), tempMin: 16, tempMax: 23, descricao: 'parcialmente nublado', icone: '02d', chuva: false, precipitacaoMm: 0,   chanceDeChuva: 15 },
  { data: fmtDate(2), tempMin: 15, tempMax: 21, descricao: 'nublado',              icone: '03d', chuva: false, precipitacaoMm: 0,   chanceDeChuva: 30 },
  { data: fmtDate(3), tempMin: 14, tempMax: 19, descricao: 'chuva fraca',          icone: '10d', chuva: true,  precipitacaoMm: 4.2, chanceDeChuva: 75 },
  { data: fmtDate(4), tempMin: 16, tempMax: 22, descricao: 'céu limpo',            icone: '01d', chuva: false, precipitacaoMm: 0,   chanceDeChuva: 10 },
  { data: fmtDate(5), tempMin: 17, tempMax: 24, descricao: 'parcialmente nublado', icone: '02d', chuva: false, precipitacaoMm: 0,   chanceDeChuva: 20 },
  { data: fmtDate(6), tempMin: 18, tempMax: 25, descricao: 'céu limpo',            icone: '01d', chuva: false, precipitacaoMm: 0,   chanceDeChuva: 5  },
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

  searchCities: async (query: string): Promise<CityResult[]> => {
    if (query.length < 2) return [];
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=pt&format=json`,
      );
      if (!res.ok) return [];
      const data = (await res.json()) as {
        results?: Array<{
          name: string;
          admin1?: string;
          country?: string;
          latitude: number;
          longitude: number;
        }>;
      };
      return (data.results ?? []).map((r) => ({
        name: r.name,
        state: r.admin1 ?? '',
        country: r.country ?? '',
        lat: r.latitude,
        lon: r.longitude,
      }));
    } catch {
      return [];
    }
  },
};
