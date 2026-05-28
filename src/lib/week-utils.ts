// Working week = Mon–Sat. Sunday excluded from displayed range.

function isoWeekMonday(weekNum: number, year: number): Date {
  // First Thursday of ISO year
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7; // 0=Mon
  const week1Monday = new Date(year, 0, 4);
  week1Monday.setDate(jan4.getDate() - jan4Day);
  const monday = new Date(week1Monday);
  monday.setDate(week1Monday.getDate() + (weekNum - 1) * 7);
  return monday;
}

export function weekRange(
  weekNum: number,
  year: number,
): { start: Date; end: Date } {
  const start = isoWeekMonday(weekNum, year);
  const end = new Date(start);
  end.setDate(start.getDate() + 5); // Saturday
  return { start, end };
}

const dayMonth = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const dayOnly = new Intl.DateTimeFormat('ru-RU', { day: 'numeric' });

export function formatWeekLabel(weekNum: number, year: number): string {
  const { start, end } = weekRange(weekNum, year);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = sameMonth ? dayOnly.format(start) : dayMonth.format(start);
  const endLabel = dayMonth.format(end);
  return `${startLabel}–${endLabel} ${year}`;
}
