import { parseLocalDate } from '@/lib/date';
import { formatKg, formatTons } from '@/lib/units';

export function fmtKg(kg: number): string {
  return formatKg(kg);
}

export function fmtTons(t: number): string {
  return formatTons(t);
}

const dateRu = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function fmtDateRu(d: Date | string): string {
  const date = typeof d === 'string' ? parseLocalDate(d) : d;
  return dateRu.format(date);
}

const dayMon = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

// «20 апр»
export function fmtDayMon(d: Date | string): string {
  const date = typeof d === 'string' ? parseLocalDate(d) : d;
  return dayMon.format(date);
}

const weekdayShort = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });

// «ПН» (Intl gives «пн» — uppercased for the day-header bar)
export function fmtWeekdayShort(d: Date | string): string {
  const date = typeof d === 'string' ? parseLocalDate(d) : d;
  return weekdayShort.format(date).toUpperCase();
}
