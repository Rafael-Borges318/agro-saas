import type { CurrentWeather, ForecastDay } from '../../../types';

const ICON_MAP: Record<string, string> = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

function getEmoji(icone: string, chuva: boolean) {
  return ICON_MAP[icone] ?? (chuva ? '🌧️' : '🌤️');
}

const DAY_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function parseDayName(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return DAY_FULL[new Date(y, m - 1, d).getDay()];
}

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div>
      <p className="text-primary-200 text-[11px] font-medium">{label}</p>
      <p className="text-white text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}

interface Props {
  current: CurrentWeather | null;
  selectedDay: ForecastDay | null;
  isToday: boolean;
}

export function WeatherDetailCard({ current, selectedDay, isToday }: Props) {
  if (!current && !selectedDay) return null;

  if (isToday && current) {
    const emoji = getEmoji(current.icone, current.chuva);
    return (
      <div className="relative overflow-hidden rounded-2xl bg-blue-gradient shadow-glow p-6 transition-all duration-300">
        <Bubbles />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-primary-100 text-xs font-semibold uppercase tracking-widest mb-2">Agora</p>
            <p className="text-white text-6xl font-bold tracking-tight leading-none">{current.temperatura}°C</p>
            <p className="text-primary-200 capitalize mt-2 text-sm">{current.descricao}</p>
          </div>
          <span className="text-6xl select-none">{emoji}</span>
        </div>
        <div className="relative mt-5 pt-4 border-t border-white/20 grid grid-cols-4 gap-2">
          <Stat label="Sensação" value={`${current.sensacao}°C`} />
          <Stat label="Umidade" value={`${current.umidade}%`} />
          <Stat label="Vento" value={`${current.vento} km/h${current.ventoDir ? ` ${current.ventoDir}` : ''}`} />
          <Stat label="Chuva hoje" value={`${current.chuvaAmm ?? 0}mm`} />
        </div>
      </div>
    );
  }

  if (!selectedDay) return null;

  const emoji = getEmoji(selectedDay.icone, selectedDay.chuva);
  const avgTemp = Math.round((selectedDay.tempMax + selectedDay.tempMin) / 2);
  const chanceChuva = selectedDay.chanceDeChuva ?? (selectedDay.chuva ? 70 : 10);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-gradient shadow-glow p-6 transition-all duration-300">
      <Bubbles />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-primary-100 text-xs font-semibold uppercase tracking-widest mb-2">
            {parseDayName(selectedDay.data)}
          </p>
          <p className="text-white text-6xl font-bold tracking-tight leading-none">{avgTemp}°C</p>
          <p className="text-primary-200 capitalize mt-2 text-sm">{selectedDay.descricao}</p>
        </div>
        <span className="text-6xl select-none">{emoji}</span>
      </div>
      <div className="relative mt-5 pt-4 border-t border-white/20 grid grid-cols-4 gap-2">
        <Stat label="Mínima" value={`${selectedDay.tempMin}°C`} />
        <Stat label="Máxima" value={`${selectedDay.tempMax}°C`} />
        <Stat label="Precipitação" value={`${selectedDay.precipitacaoMm}mm`} />
        <Stat label="Chance chuva" value={`${chanceChuva}%`} />
      </div>
    </div>
  );
}

function Bubbles() {
  return (
    <>
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full" />
      <div className="absolute right-4 bottom-0 w-20 h-20 bg-white/5 rounded-full" />
    </>
  );
}
