// Pure date helpers. ISO 'YYYY-MM-DD' is treated as plain local date — no UTC conversions.

export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 0=Mon … 5=Sat, 6=Sun
export function dayOfWeekMonStart(d: Date): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const js = d.getDay(); // 0=Sun … 6=Sat
  return ((js + 6) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function isSunday(d: Date | string): boolean {
  const date = typeof d === 'string' ? parseLocalDate(d) : d;
  return date.getDay() === 0;
}

// ISO 8601 week number (Thursday-anchored)
export function isoWeek(d: Date): { weekNum: number; year: number } {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // Shift to Thursday of current ISO week
  const day = (t.getDay() + 6) % 7; // 0=Mon … 6=Sun
  t.setDate(t.getDate() - day + 3);
  const isoYear = t.getFullYear();
  const firstThursday = new Date(isoYear, 0, 4);
  const firstThursdayDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDay + 3);
  const weekNum =
    1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return { weekNum, year: isoYear };
}

export function currentWeekId(): { weekNum: number; year: number } {
  return isoWeek(new Date());
}
