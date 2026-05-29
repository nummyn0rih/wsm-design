import { describe, it, expect, afterEach, vi } from 'vitest';
import { parseLocalDate, isoWeek, isSunday, currentWeekId } from '@/lib/date';

describe('parseLocalDate', () => {
  it('parses as local midnight, no UTC shift', () => {
    const d = parseLocalDate('2025-04-21');
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(3); // April (0-based)
    expect(d.getDate()).toBe(21);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});

describe('isoWeek edge cases', () => {
  it('2025-04-21 is a regular mid-year week', () => {
    const { weekNum, year } = isoWeek(parseLocalDate('2025-04-21'));
    expect(year).toBe(2025);
    expect(weekNum).toBe(17);
  });

  it('2026-01-01 belongs to ISO W1 2026', () => {
    const { weekNum, year } = isoWeek(parseLocalDate('2026-01-01'));
    expect(weekNum).toBe(1);
    expect(year).toBe(2026);
  });

  it('2025-12-29 (Mon) belongs to ISO W1 of 2026 (year-cross)', () => {
    const { weekNum, year } = isoWeek(parseLocalDate('2025-12-29'));
    expect(weekNum).toBe(1);
    expect(year).toBe(2026);
  });

  it('2026-12-31 belongs to ISO W53 2026', () => {
    const { weekNum, year } = isoWeek(parseLocalDate('2026-12-31'));
    expect(weekNum).toBe(53);
    expect(year).toBe(2026);
  });
});

describe('isSunday', () => {
  it('2025-04-27 → true', () => {
    expect(isSunday('2025-04-27')).toBe(true);
  });
  it('2025-04-21 → false', () => {
    expect(isSunday('2025-04-21')).toBe(false);
  });
});

describe('currentWeekId', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('matches isoWeek of mocked today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 3, 23)); // 23 Apr 2025, local
    expect(currentWeekId()).toEqual({ weekNum: 17, year: 2025 });
  });
});
