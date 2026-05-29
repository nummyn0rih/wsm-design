import { describe, it, expect } from 'vitest';
import { getCellState } from '@/lib/cell-state';

// Args in TONS. Boundaries from ACCEPTANCE §5: 0, 79, 80, 99, 100, 120, 121.
// plan=100 → fact equals the pct directly.
describe('getCellState', () => {
  it('empty: no plan, no fact', () => {
    expect(getCellState(0, 0)).toBe('empty');
  });

  it('emptyOver: no plan, positive fact', () => {
    expect(getCellState(0, 5)).toBe('emptyOver');
  });

  it('short: pct < 80', () => {
    expect(getCellState(100, 79)).toBe('short'); // 79%
    expect(getCellState(100, 0)).toBe('short'); // 0% with plan
  });

  it('close: 80 <= pct < 100', () => {
    expect(getCellState(100, 80)).toBe('close'); // 80%
    expect(getCellState(100, 99)).toBe('close'); // 99%
  });

  it('norm: 100 <= pct <= 120', () => {
    expect(getCellState(100, 100)).toBe('norm'); // 100%
    expect(getCellState(100, 120)).toBe('norm'); // 120%
  });

  it('over: pct > 120', () => {
    expect(getCellState(100, 121)).toBe('over'); // 121%
  });
});
