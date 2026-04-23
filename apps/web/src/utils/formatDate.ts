export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('pt-BR', options).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatRelative(date: string | Date): string {
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const diff = (new Date(date).getTime() - Date.now()) / 1000;
  if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  return rtf.format(Math.round(diff / 86400), 'day');
}
