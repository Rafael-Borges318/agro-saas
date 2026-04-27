import { useEffect, useRef } from 'react';
import { useClimaStore } from '../../store/clima.store';
import { climaService } from '../../services/clima.service';
import type { CityResult, CurrentWeather, ForecastDay } from '../../types';
import { CityAutocomplete } from './components/CityAutocomplete';
import { DaySelector } from './components/DaySelector';
import { WeatherDetailCard } from './components/WeatherDetailCard';
import { FavoritesBar } from './components/FavoritesBar';

/* ─── Date helpers ──────────────────────────────────────────────────────── */
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function parseForecastDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return { dayName: DAY_SHORT[date.getDay()], dayNum: d };
}

/* ─── Derived data ──────────────────────────────────────────────────────── */
function getAlerts(current: CurrentWeather | null, forecast: ForecastDay[]) {
  const alerts: { type: 'danger' | 'warning'; title: string; desc: string }[] = [];

  const maxRainDay = forecast.reduce(
    (best, d) => (d.precipitacaoMm > best.precipitacaoMm ? d : best),
    { precipitacaoMm: 0 } as ForecastDay,
  );

  if (maxRainDay.precipitacaoMm >= 15) {
    const { dayName } = parseForecastDate(maxRainDay.data);
    alerts.push({
      type: 'danger',
      title: 'Chuva forte prevista',
      desc: `Precipitação acumulada de ${maxRainDay.precipitacaoMm.toFixed(0)}mm prevista para ${dayName}. Evite aplicação de defensivos.`,
    });
  }

  if (current && current.vento >= 25) {
    alerts.push({
      type: 'warning',
      title: 'Vento moderado',
      desc: `Rajadas de até ${Math.round(current.vento * 1.3)} km/h esperadas. Cuidado com pulverizações.`,
    });
  }

  return alerts;
}

function getRecommendations(current: CurrentWeather | null, forecast: ForecastDay[]) {
  const recs: string[] = [];
  const rainIn2Days = forecast.slice(0, 2).some((d) => d.chuva);

  if (rainIn2Days) recs.push('Evite aplicar defensivos nas próximas 48h devido à previsão de chuva');
  if (current && current.umidade >= 55 && current.umidade <= 85)
    recs.push('Umidade ideal para germinação de sementes');
  if (current && current.temperatura >= 15 && current.temperatura <= 30)
    recs.push('Temperatura favorável para crescimento vegetativo');
  if (current && current.vento >= 25)
    recs.push('Ventos moderados — não recomendado para pulverização aérea');
  else if (!rainIn2Days && recs.length < 4)
    recs.push('Condições favoráveis para pulverização e manejo de campo');

  return recs.slice(0, 4);
}

function getMonthlySummary(current: CurrentWeather | null, forecast: ForecastDay[]) {
  if (!current || forecast.length === 0) return null;
  const month = MONTHS[new Date().getMonth()];
  const avgTemp =
    Math.round(
      ((forecast.reduce((acc, d) => acc + (d.tempMax + d.tempMin) / 2, 0) / forecast.length +
        current.temperatura) /
        2) *
        10,
    ) / 10;
  const totalRain = Math.round(forecast.reduce((acc, d) => acc + d.precipitacaoMm, 0));
  const rainDays = forecast.filter((d) => d.chuva).length;
  return { month, avgTemp, totalRain, rainDays, avgHumidity: current.umidade };
}

/* ─── Inline SVG icons ──────────────────────────────────────────────────── */
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

/* ─── Component ─────────────────────────────────────────────────────────── */
export function Clima() {
  const {
    current, forecast, loading, error, cidade,
    favorites, selectedDayIndex,
    setCidade, setCurrent, setForecast, setLoading, setError,
    addFavorite, removeFavorite, setSelectedDayIndex,
  } = useClimaStore();

  const abortRef = useRef<AbortController | null>(null);

  const isFavorite = favorites.includes(current?.cidade ?? cidade);

  async function fetchClima(query: { cidade: string } | { lat: number; lon: number; displayName: string }) {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setSelectedDayIndex(0);

    const displayName = 'displayName' in query ? query.displayName : query.cidade;
    setCidade(displayName);

    const serviceQuery = 'displayName' in query
      ? { lat: query.lat, lon: query.lon }
      : { cidade: query.cidade };

    try {
      const [currentRes, forecastRes] = await Promise.all([
        climaService.getCurrent(serviceQuery),
        climaService.getForecast(serviceQuery),
      ]);
      setCurrent(currentRes.data);
      setForecast(forecastRes.data);
    } catch {
      setError('Não foi possível carregar os dados do clima. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleCitySelect(city: CityResult) {
    fetchClima({ lat: city.lat, lon: city.lon, displayName: city.name });
  }

  function handleRawSearch(query: string) {
    fetchClima({ cidade: query });
  }

  function handleFavoriteSelect(city: string) {
    fetchClima({ cidade: city });
  }

  function handleToggleFavorite() {
    const cityName = current?.cidade ?? cidade;
    if (isFavorite) {
      removeFavorite(cityName);
    } else {
      addFavorite(cityName);
    }
  }

  useEffect(() => {
    if (!current) fetchClima({ cidade });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedDay = forecast[selectedDayIndex] ?? null;
  const alerts = getAlerts(current, forecast);
  const recommendations = getRecommendations(current, forecast);
  const summary = getMonthlySummary(current, forecast);

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clima e Previsão</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {current?.cidade ?? cidade}&nbsp;·&nbsp;Brasil
        </p>
      </div>

      {/* ── Search + Refresh ──────────────────────────────────────────── */}
      <div className="flex gap-2">
        <CityAutocomplete
          initialValue={current?.cidade ?? cidade}
          loading={loading}
          onSelect={handleCitySelect}
          onSubmitRaw={handleRawSearch}
        />
        <button
          type="button"
          onClick={() => fetchClima({ cidade: current?.cidade ?? cidade })}
          disabled={loading}
          className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <IconSearch />
          <span className="hidden sm:inline">Buscar</span>
        </button>
        <button
          type="button"
          onClick={() => fetchClima({ cidade: current?.cidade ?? cidade })}
          disabled={loading}
          title="Atualizar"
          className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:opacity-60 transition-colors"
        >
          <IconRefresh spinning={loading} />
        </button>
      </div>

      {/* ── Favorites bar ─────────────────────────────────────────────── */}
      <FavoritesBar
        favorites={favorites}
        currentCity={current?.cidade ?? cidade}
        isFavorite={isFavorite}
        onSelect={handleFavoriteSelect}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────────── */}
      {loading && !current && (
        <div className="space-y-3">
          <div className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 h-28 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* ── Weather detail card ───────────────────────────────────────── */}
      {(current || selectedDay) && (
        <WeatherDetailCard
          current={current}
          selectedDay={selectedDay}
          isToday={selectedDayIndex === 0}
        />
      )}

      {/* ── 7-day selector ────────────────────────────────────────────── */}
      {forecast.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Previsão de 7 Dias</h2>
          <DaySelector
            forecast={forecast}
            selectedIndex={selectedDayIndex}
            onSelect={setSelectedDayIndex}
          />
        </div>
      )}

      {/* ── Alerts ────────────────────────────────────────────────────── */}
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={[
            'rounded-2xl px-4 py-3 border',
            alert.type === 'danger'
              ? 'bg-red-50 border-red-100'
              : 'bg-amber-50 border-amber-100',
          ].join(' ')}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <p className={`text-sm font-semibold ${alert.type === 'danger' ? 'text-red-700' : 'text-amber-700'}`}>
              {alert.title}
            </p>
          </div>
          <p className={`text-xs mt-1 ml-6 ${alert.type === 'danger' ? 'text-red-500' : 'text-amber-600'}`}>
            {alert.desc}
          </p>
        </div>
      ))}

      {/* ── Recommendations ───────────────────────────────────────────── */}
      {current && recommendations.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Recomendações para o Produtor</h2>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-card px-4 py-3">
                <span className="w-5 h-5 bg-agro-green rounded-full text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Monthly summary ───────────────────────────────────────────── */}
      {summary && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Resumo Mensal — {summary.month}</h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-orange-50 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
              <span className="text-2xl">🌡️</span>
              <p className="text-[11px] text-orange-500 font-medium">Temp Média</p>
              <p className="text-base font-bold text-orange-700">{summary.avgTemp}°C</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
              <span className="text-2xl">💧</span>
              <p className="text-[11px] text-blue-500 font-medium">Chuva Total</p>
              <p className="text-base font-bold text-blue-700">{summary.totalRain}mm</p>
            </div>
            <div className="bg-cyan-50 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
              <span className="text-2xl">🌧️</span>
              <p className="text-[11px] text-cyan-600 font-medium">Dias de Chuva</p>
              <p className="text-base font-bold text-cyan-700">{summary.rainDays}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center text-center gap-1">
              <span className="text-2xl">💦</span>
              <p className="text-[11px] text-gray-500 font-medium">Umidade Média</p>
              <p className="text-base font-bold text-gray-700">{summary.avgHumidity}%</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {!loading && !error && !current && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card flex flex-col items-center gap-4 py-16 text-center">
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
