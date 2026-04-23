import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  hover?: boolean;
}

export function Card({ title, description, children, className = '', hover = false, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl bg-white border border-gray-100/80',
        'shadow-card',
        hover && 'transition-all duration-200 hover:shadow-card-hover hover:border-gray-200 hover:-translate-y-0.5 cursor-pointer',
        'p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {(title || description) && (
        <div className="mb-3">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

type StatColor = 'primary' | 'yellow' | 'red' | 'blue' | 'green' | 'olive';

const statColorMap: Record<StatColor, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-500', ring: 'ring-primary-100' },
  blue:    { bg: 'bg-sky-50',     text: 'text-sky-500',     ring: 'ring-sky-100' },
  yellow:  { bg: 'bg-amber-50',   text: 'text-amber-500',   ring: 'ring-amber-100' },
  red:     { bg: 'bg-red-50',     text: 'text-red-500',     ring: 'ring-red-100' },
  green:   { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  olive:   { bg: 'bg-yellow-50',  text: 'text-yellow-700',  ring: 'ring-yellow-100' },
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  color = 'primary',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: StatColor;
}) {
  const c = statColorMap[color];

  return (
    <div className="card flex items-center gap-3.5">
      <div
        className={[
          'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
          'ring-1',
          c.bg,
          c.text,
          c.ring,
        ].join(' ')}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-400 truncate mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        {trend && (
          <p
            className={[
              'text-xs mt-1',
              trendUp === undefined
                ? 'text-gray-400'
                : trendUp
                ? 'text-emerald-600 font-medium'
                : 'text-red-500 font-medium',
            ].join(' ')}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
