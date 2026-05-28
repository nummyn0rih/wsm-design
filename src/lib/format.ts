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
