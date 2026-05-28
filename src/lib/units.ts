// Units discipline:
//   ShipmentItem.kg  — integer > 0 (kilograms)
//   WeekPlan.plan[r][d] — number, step 0.1 (tons)

export function kgToTons(kg: number): number {
  return kg / 1000;
}

export function tonsToKg(t: number): number {
  return t * 1000;
}

export function parseTonsInput(input: string): number | null {
  const s = input.trim().replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function roundToStep(n: number, step: number): number {
  const rounded = Math.round(n / step) * step;
  return Number(rounded.toFixed(10));
}

export function formatTons(n: number, locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatKg(kg: number, locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kg);
}
