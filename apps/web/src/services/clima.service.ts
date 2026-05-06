import { api } from './api';
import { cache, TTL } from './cache';
import type { ApiResponse, CityResult, CurrentWeather, ForecastDay, MonthlyClimate } from '../types';

type ClimaQuery = { cidade: string } | { lat: number; lon: number };

const MONTHS_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/* ─── Mock fallback ──────────────────────────────────────────────────────── */
const MOCK_CURRENT: CurrentWeather = {
  cidade: 'Torres',
  temperatura: 23,
  sensacao: 21,
  umidade: 70,
  chuva: false,
  chuvaAmm: 0,
  vento: 16,
  ventoDir: 'SE',
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

const MOCK_MONTHLY: MonthlyClimate[] = MONTHS_NAMES.map((mes, i) => {
  const m = i + 1;
  const isSummer = m <= 2 || m === 12;
  const isWinter = m >= 6 && m <= 8;
  return {
    mes,
    mesNum: m,
    tempMedia: isWinter ? 14 : isSummer ? 26 : 20,
    tempMin: isWinter ? 8 : isSummer ? 19 : 14,
    tempMax: isWinter ? 20 : isSummer ? 32 : 26,
    precipitacaoMm: isSummer ? 120 : isWinter ? 40 : 80,
    chanceChuva: isSummer ? 60 : isWinter ? 25 : 40,
    tendencia: isSummer ? 'chuvoso' : isWinter ? 'seco' : 'estável',
  };
});

function fmtDate(daysAhead: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function wrapMock<T>(data: T): ApiResponse<T> {
  return { status: 'success', data };
}

function queryKey(prefix: string, q: ClimaQuery): string {
  if ('cidade' in q) return `${prefix}:cidade:${q.cidade.toLowerCase()}`;
  return `${prefix}:coords:${q.lat.toFixed(2)},${q.lon.toFixed(2)}`;
}

export const climaService = {
  getCurrent: (q: ClimaQuery): Promise<ApiResponse<CurrentWeather>> =>
    cache.dedupe(
      queryKey('current', q),
      async () => {
        try {
          const res = await api.get<ApiResponse<CurrentWeather>>('/clima', { params: q });
          return res.data;
        } catch {
          return wrapMock(MOCK_CURRENT);
        }
      },
      TTL.CLIMATE_CURRENT,
    ),

  getForecast: (q: ClimaQuery): Promise<ApiResponse<ForecastDay[]>> =>
    cache.dedupe(
      queryKey('forecast', q),
      async () => {
        try {
          const res = await api.get<ApiResponse<ForecastDay[]>>('/clima/forecast', { params: q });
          return res.data;
        } catch {
          return wrapMock(MOCK_FORECAST);
        }
      },
      TTL.CLIMATE_FORECAST,
    ),

  /* Uses Open-Meteo archive API (ERA5) for the previous year as climate normals */
  getMonthlyClimate: (lat: number, lon: number): Promise<MonthlyClimate[]> =>
    cache.dedupe(
      `monthly:${lat.toFixed(2)},${lon.toFixed(2)}`,
      async () => {
        try {
          const prevYear = new Date().getFullYear() - 1;
          const res = await fetch(
            `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${prevYear}-01-01&end_date=${prevYear}-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FSao_Paulo`,
          );
          if (!res.ok) throw new Error('archive API error');
          const data = (await res.json()) as {
            daily: {
              time: string[];
              temperature_2m_max: (number | null)[];
              temperature_2m_min: (number | null)[];
              precipitation_sum: (number | null)[];
            };
          };

          const monthly: MonthlyClimate[] = [];
          for (let m = 1; m <= 12; m++) {
            const indices = data.daily.time.reduce<number[]>((acc, date, i) => {
              if (parseInt(date.split('-')[1]) === m) acc.push(i);
              return acc;
            }, []);
            if (indices.length === 0) continue;

            const maxTemps = indices.map(i => data.daily.temperature_2m_max[i]).filter((v): v is number => v != null && !isNaN(v));
            const minTemps = indices.map(i => data.daily.temperature_2m_min[i]).filter((v): v is number => v != null && !isNaN(v));
            const rains    = indices.map(i => data.daily.precipitation_sum[i]).filter((v): v is number => v != null && !isNaN(v));

            const avgMax    = maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length;
            const avgMin    = minTemps.reduce((a, b) => a + b, 0) / minTemps.length;
            const totalRain = rains.reduce((a, b) => a + b, 0);
            const rainDays  = rains.filter(r => r >= 1).length;
            const chanceChuva = Math.round((rainDays / indices.length) * 100);

            const tendencia: 'seco' | 'chuvoso' | 'estável' =
              chanceChuva >= 50 || totalRain >= 100 ? 'chuvoso' :
              chanceChuva <= 20 && totalRain < 30   ? 'seco'    : 'estável';

            monthly.push({
              mes: MONTHS_NAMES[m - 1],
              mesNum: m,
              tempMedia: Math.round(((avgMax + avgMin) / 2) * 10) / 10,
              tempMin: Math.round(avgMin * 10) / 10,
              tempMax: Math.round(avgMax * 10) / 10,
              precipitacaoMm: Math.round(totalRain),
              chanceChuva,
              tendencia,
            });
          }
          return monthly;
        } catch {
          return MOCK_MONTHLY;
        }
      },
      TTL.CLIMATE_MONTHLY,
    ),

  /* City search via Open-Meteo geocoding — strips UF suffix and sorts exact matches first */
  searchCities: async (query: string): Promise<CityResult[]> => {
    const q = query.trim();
    if (q.length < 2) return [];
    const cleanQuery = q.replace(/\s+[A-Z]{2}$/, '').trim();
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=8&language=pt&format=json`,
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
      const results: CityResult[] = (data.results ?? []).map((r) => ({
        name: r.name,
        state: r.admin1 ?? '',
        country: r.country ?? '',
        lat: r.latitude,
        lon: r.longitude,
      }));

      const lower = cleanQuery.toLowerCase();
      return results.sort((a, b) => {
        const aExact = a.name.toLowerCase() === lower ? 0 : 1;
        const bExact = b.name.toLowerCase() === lower ? 0 : 1;
        return aExact - bExact;
      });
    } catch {
      return [];
    }
  },
};
