import { isSunday, isoWeek, currentWeekId, parseLocalDate } from '@/lib/date';

export { isSunday, currentWeekId };

export function isWorkingDay(d: Date | string): boolean {
  return !isSunday(d);
}

export function weekIdFromDate(
  d: Date | string,
): { weekNum: number; year: number } {
  const date = typeof d === 'string' ? parseLocalDate(d) : d;
  return isoWeek(date);
}
