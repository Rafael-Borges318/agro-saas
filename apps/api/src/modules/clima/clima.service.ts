import { env } from '../../config/env';
import { logger } from '../../lib/logger';

const OW_BASE = 'https://api.openweathermap.org/data/2.5';

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
  isMock?: boolean;
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

export type ClimaQuery = { cidade?: string; lat?: number; lon?: number };

/* ─── Mock fallback (used when API key absent or external request fails) ── */
function mockCurrent(cidade: string): CurrentWeather {
  const hour = new Date().getHours();
  const temp = 22 + Math.round(Math.sin((hour - 6) * Math.PI / 12) * 8);
  return {
    cidade,
    temperatura: temp,
    sensacao: temp - 2,
    umidade: 68,
    chuva: false,
    vento: 14,
    descricao: 'parcialmente nublado',
    icone: hour >= 6 && hour < 18 ? '02d' : '02n',
    lat: -29.33,
    lon: -49.73,
    isMock: true,
  };
}

function mockForecast(): ForecastDay[] {
  const today = new Date();
  const descs = ['céu limpo', 'parcialmente nublado', 'nublado', 'chuva fraca', 'céu limpo'];
  const icons = ['01d', '02d', '03d', '10d', '01d'];
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      data: d.toISOString().split('T')[0],
      tempMin: 16 + i,
      tempMax: 24 + i,
      descricao: descs[i],
      icone: icons[i],
      chuva: i === 3,
      precipitacaoMm: i === 3 ? 4.2 : 0,
    };
  });
}

/* ─── OpenWeather fetch (with 8 s timeout) ──────────────────────────────── */
async function owFetch<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const key = env.OPENWEATHER_API_KEY;
  if (!key) throw new Error('OPENWEATHER_API_KEY não configurada');

  const qs = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    appid: key,
    units: 'metric',
    lang: 'pt_br',
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${OW_BASE}/${path}?${qs}`, { signal: controller.signal });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message ?? `OpenWeather ${res.status}`);
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

function locationParams(q: ClimaQuery): Record<string, string | number> {
  if (q.lat !== undefined && q.lon !== undefined) return { lat: q.lat, lon: q.lon };
  return { q: q.cidade ?? 'São Paulo' };
}

export const climaService = {
  async getCurrent(q: ClimaQuery): Promise<CurrentWeather> {
    const cidade = q.cidade ?? 'Torres';
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = await owFetch<any>('weather', locationParams(q));
      const main = d.weather?.[0]?.main as string | undefined;
      return {
        cidade: d.name as string,
        temperatura: Math.round(d.main.temp as number),
        sensacao: Math.round(d.main.feels_like as number),
        umidade: d.main.humidity as number,
        chuva: !!(d.rain || main === 'Rain' || main === 'Drizzle' || main === 'Thunderstorm'),
        vento: Math.round(((d.wind?.speed as number) ?? 0) * 3.6),
        descricao: (d.weather?.[0]?.description as string) ?? '',
        icone: (d.weather?.[0]?.icon as string) ?? '',
        lat: d.coord.lat as number,
        lon: d.coord.lon as number,
      };
    } catch (err) {
      logger.warn(`[clima] getCurrent falhou (${String(err)}), usando mock`);
      return mockCurrent(cidade);
    }
  },

  async getForecast(q: ClimaQuery): Promise<ForecastDay[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = await owFetch<any>('forecast', { ...locationParams(q), cnt: 40 });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const byDay = new Map<string, any[]>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of d.list as any[]) {
        const day = (item.dt_txt as string).split(' ')[0];
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day)!.push(item);
      }

      return Array.from(byDay.entries())
        .slice(0, 5)
        .map(([day, items]) => {
          const temps = items.map((i) => i.main.temp as number);
          const noon =
            items.find((i) => (i.dt_txt as string).includes('12:00')) ??
            items[Math.floor(items.length / 2)];
          return {
            data: day,
            tempMin: Math.round(Math.min(...temps)),
            tempMax: Math.round(Math.max(...temps)),
            descricao: (noon.weather?.[0]?.description as string) ?? '',
            icone: (noon.weather?.[0]?.icon as string) ?? '',
            chuva: items.some(
              (i) =>
                i.rain ||
                i.weather?.[0]?.main === 'Rain' ||
                i.weather?.[0]?.main === 'Drizzle' ||
                i.weather?.[0]?.main === 'Thunderstorm',
            ),
            precipitacaoMm: parseFloat(
              items
                .reduce((acc: number, i) => acc + ((i.rain?.['3h'] as number) ?? 0), 0)
                .toFixed(1),
            ),
          };
        });
    } catch (err) {
      logger.warn(`[clima] getForecast falhou (${String(err)}), usando mock`);
      return mockForecast();
    }
  },
};
