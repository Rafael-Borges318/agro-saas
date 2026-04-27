import { useEffect, useRef, useState } from 'react';
import { useClimaStore } from '../../store/clima.store';
import { climaService } from '../../services/clima.service';
import type { AxiosError } from 'axios';

/* ─── Icons ─── */
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconDroplets() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
    </svg>
  );
}
function IconWind() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
    </svg>
  );
}
function IconThermometer() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconRefresh({ spinning }: { spinning: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={['w-4 h-4 transition-transform', spinning ? 'animate-spin' : ''].join(' ')}>
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

/* ─── Weather icon from OW icon code ─── */
function WeatherEmoji({ icone, chuva }: { icone: string; chuva: boolean }) {
  if (!icone) return <span className="text-5xl">{chuva ? '🌧️' : '🌤️'}</span>;
  const map: Record<string, string> = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return <span className="text-5xl">{map[icone] ?? (chuva ? '🌧️' : '🌤️')}</span>;
}

function ForecastEmoji({ icone, chuva }: { icone: string; chuva: boolean }) {
  const map: Record<string, string> = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  if (!icone) return <>{chuva ? '🌧️' : '🌤️'}</>;
  return <>{map[icone] ?? (chuva ? '🌧️' : '🌤️')}</>;
}

const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatForecastDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() === today.getTime()) return 'Hoje';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() === tomorrow.getTime()) return 'Amanhã';
  return DAY_SHORT[date.getDay()];
}

/* ─── Component ─── */
export function Clima() {
  const { current, forecast, loading, error, cidade, setCidade, setCurrent, setForecast, setLoading, setError } =
    useClimaStore();
  const [input, setInput] = useState(cidade);
  const abortRef = useRef<AbortController | null>(null);

  async function fetchClima(cidadeQuery: string) {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setCidade(cidadeQuery);

    try {
      const [currentRes, forecastRes] = await Promise.all([
        climaService.getCurrent({ cidade: cidadeQuery }),
        climaService.getForecast({ cidade: cidadeQuery }),
      ]);
      setCurrent(currentRes.data);
      setForecast(forecastRes.data);
    } catch (err) {
      const msg = (err as AxiosError<{ message?: string }>).response?.data?.message;
      if (msg?.toLowerCase().includes('city not found')) {
        setError('Cidade não encontrada. Verifique o nome e tente novamente.');
      } else if (msg?.toLowerCase().includes('não configurada')) {
        setError('API de clima não configurada no servidor. Adicione OPENWEATHER_API_KEY ao .env.');
      } else {
        setError('Não foi possível carregar os dados do clima. Tente novamente.');
      }
    }
  }

  useEffect(() => {
    if (!current) fetchClima(cidade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (q) fetchClima(q);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clima</h1>
        <p className="text-gray-400 text-sm mt-0.5">Previsão meteorológica para sua região</p>
      </div>

      {/* ── Search ── */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            <IconMapPin />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Buscar cidade... (ex: Porto Alegre)"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <IconSearch />
          Buscar
        </button>
        <button
          type="button"
          onClick={() => fetchClima(cidade)}
          disabled={loading}
          className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:opacity-60 transition-colors"
          title="Atualizar"
        >
          <IconRefresh spinning={loading} />
        </button>
      </form>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && !current && (
        <div className="space-y-3">
          <div className="h-44 bg-gray-100 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* ── Current weather card ── */}
      {current && (
        <div className="relative overflow-hidden rounded-3xl bg-blue-gradient p-5 sm:p-6 shadow-glow">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -right-2 bottom-0 w-24 h-24 bg-white/5 rounded-full" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-4 h-4 text-primary-200"><IconMapPin /></div>
                <p className="text-primary-200 text-sm font-semibold">{current.cidade}</p>
              </div>
              <div className="flex items-end gap-3 mb-1">
                <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
                  {current.temperatura}°C
                </span>
              </div>
              <p className="text-primary-200 text-sm capitalize mb-4">{current.descricao}</p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <IconThermometer />
                  Sensação {current.sensacao}°C
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <IconDroplets />
                  {current.umidade}% umidade
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <IconWind />
                  {current.vento} km/h vento
                </div>
                {current.chuva && (
                  <div className="flex items-center gap-1.5 bg-blue-400/30 text-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-300/20">
                    Chuva prevista
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <WeatherEmoji icone={current.icone} chuva={current.chuva} />
            </div>
          </div>
        </div>
      )}

      {/* ── 5-day forecast ── */}
      {forecast.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Próximos dias</h2>
          <div className="grid grid-cols-5 gap-2">
            {forecast.map((day) => (
              <div
                key={day.data}
                className="bg-white rounded-2xl border border-gray-100 shadow-card p-3 flex flex-col items-center gap-2 text-center"
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {formatForecastDate(day.data)}
                </p>
                <span className="text-2xl">
                  <ForecastEmoji icone={day.icone} chuva={day.chuva} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{day.tempMax}°</p>
                  <p className="text-xs text-gray-400">{day.tempMin}°</p>
                </div>
                {day.chuva && day.precipitacaoMm > 0 && (
                  <p className="text-[10px] text-blue-500 font-semibold">{day.precipitacaoMm}mm</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && !current && (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-6xl">🌦️</span>
          <div>
            <p className="font-semibold text-gray-700">Busque uma cidade</p>
            <p className="text-sm text-gray-400 mt-1">
              Digite o nome de uma cidade acima para ver a previsão do tempo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
