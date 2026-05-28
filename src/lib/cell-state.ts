import type { CellState } from '@/types/domain';

// Source: reference/project/plan-view.jsx L166–192. Do not redesign.
// Arguments in TONS.
export function getCellState(planTons: number, factTons: number): CellState {
  if (!planTons || planTons <= 0) {
    return factTons && factTons > 0 ? 'emptyOver' : 'empty';
  }
  const pct = (factTons / planTons) * 100;
  if (pct < 80) return 'short';
  if (pct < 100) return 'close';
  if (pct <= 120) return 'norm';
  return 'over';
}

export interface CellStyle {
  bg: string;
  border: string;
  bar: string;
  label: string;
  tag?: string;
}

// Source: DESIGN.md §Plan cell palette. Verbatim — do not redesign.
export const CELL_STYLES: Record<CellState, CellStyle> = {
  empty: { bg: '#f5f3ed', border: '#d8d4c8', bar: '#c8c4b8', label: '#999' },
  emptyOver: {
    bg: '#fadbb8',
    border: '#d89060',
    bar: '#c06820',
    label: '#a04000',
    tag: 'перебор (без плана)',
  },
  short: {
    bg: '#fbe0e0',
    border: '#e0a0a0',
    bar: '#c04040',
    label: '#a02020',
    tag: 'недобор',
  },
  close: {
    bg: '#fbf2d8',
    border: '#d8c068',
    bar: '#c89020',
    label: '#a06000',
    tag: 'почти план',
  },
  norm: {
    bg: '#d8ead4',
    border: '#7eb070',
    bar: '#1a6b3a',
    label: '#1a6b3a',
    tag: 'норма',
  },
  over: {
    bg: '#fadbb8',
    border: '#d89060',
    bar: '#c06820',
    label: '#a04000',
    tag: 'перебор',
  },
};
