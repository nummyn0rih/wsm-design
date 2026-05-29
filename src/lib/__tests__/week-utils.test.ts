import { describe, it, expect } from 'vitest';
import { formatWeekLabel } from '@/lib/week-utils';
import { isoWeek, parseLocalDate } from '@/lib/date';

describe('formatWeekLabel', () => {
  it('week of 2025-04-21 → "21–26 апр 2025" (Mon–Sat, same month)', () => {
    const { weekNum, year } = isoWeek(parseLocalDate('2025-04-21'));
    // Allow ICU short-month trailing dot ("апр." vs "апр") across builds.
    expect(formatWeekLabel(weekNum, year)).toMatch(/^21–26 апр\.? 2025$/);
  });

  it('month-cross week shows month on start label too', () => {
    // Week of 2025-04-28 (Mon) → 28 апр – 3 мая 2025.
    const { weekNum, year } = isoWeek(parseLocalDate('2025-04-28'));
    const label = formatWeekLabel(weekNum, year);
    expect(label).toMatch(/^28 апр\.?–3 мая 2025$/);
    // start label must include a month name (not bare "28")
    expect(label).toMatch(/28 апр/);
  });
});
