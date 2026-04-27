import type { ForecastDay } from '../../../types';

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

const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getEmoji(icone: string, chuva: boolean) {
  return ICON_MAP[icone] ?? (chuva ? '🌧️' : '🌤️');
}

function parseForecastDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return { dayName: DAY_SHORT[date.getDay()], dayNum: d };
}

interface Props {
  forecast: ForecastDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DaySelector({ forecast, selectedIndex, onSelect }: Props) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      {forecast.map((day, i) => {
        const { dayName, dayNum } = parseForecastDate(day.data);
        const isSelected = i === selectedIndex;
        const isToday = i === 0;

        return (
          <button
            key={day.data}
            type="button"
            onClick={() => onSelect(i)}
            className={[
              'flex-shrink-0 rounded-2xl px-3 py-3 flex flex-col items-center gap-1.5 min-w-[72px] transition-all duration-200 focus:outline-none',
              isSelected
                ? 'bg-primary-600 shadow-glow scale-105 text-white'
                : isToday
                ? 'bg-primary-50 border-2 border-primary-200 hover:bg-primary-100'
                : 'bg-white border border-gray-100 shadow-card hover:border-primary-200 hover:shadow-md',
            ].join(' ')}
          >
            <p className={[
              'text-[11px] font-bold uppercase tracking-wide',
              isSelected ? 'text-white' : isToday ? 'text-primary-600' : 'text-gray-500',
            ].join(' ')}>
              {isToday ? 'Hoje' : dayName}
            </p>
            <p className={[
              'text-[11px] font-semibold',
              isSelected ? 'text-primary-100' : 'text-gray-400',
            ].join(' ')}>
              {dayNum}
            </p>
            <span className="text-2xl leading-none select-none">{getEmoji(day.icone, day.chuva)}</span>
            <p className={[
              'text-sm font-bold leading-none',
              isSelected ? 'text-white' : 'text-gray-900',
            ].join(' ')}>
              {day.tempMax}°
            </p>
            <p className={[
              'text-[11px]',
              isSelected ? 'text-primary-200' : 'text-gray-400',
            ].join(' ')}>
              {day.tempMin}°
            </p>
            {day.chanceDeChuva !== undefined && day.chanceDeChuva >= 30 && (
              <p className={[
                'text-[10px] font-semibold',
                isSelected ? 'text-primary-100' : 'text-primary-500',
              ].join(' ')}>
                {day.chanceDeChuva}%
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
