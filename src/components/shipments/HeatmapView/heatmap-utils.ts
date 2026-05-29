import type { RawMaterial, Shipment } from '@/types/domain';
import { dayOfWeekMonStart, isoWeek, parseLocalDate } from '@/lib/date';

export interface HeatmapRow {
  rawId: string;
  name: string;
  /** kg summed per weekday, index 0=Mon … 5=Sat */
  cells: number[];
  total: number;
}

export interface HeatmapData {
  rows: HeatmapRow[];
  /** kg summed per weekday across all visible rows */
  dayTotals: number[];
  grandTotal: number;
  /** largest positive single cell — intensity scale denominator */
  maxV: number;
}

const DAYS = 6; // Mon–Sat

// Sums ShipmentItem.kg by rawId × weekday for the given ISO week, across ALL three
// statuses (fact = scheduled + sent + arrived). Rows = raws (sortOrder ASC) that
// have at least one positive cell — auto-filter, independent of WeekPlan.visibleRaws.
export function aggregateWeek(
  shipments: Shipment[],
  raws: RawMaterial[],
  weekNum: number,
  year: number,
): HeatmapData {
  const byRaw = new Map<string, number[]>();

  for (const s of shipments) {
    const d = parseLocalDate(s.arrDate);
    const w = isoWeek(d);
    if (w.weekNum !== weekNum || w.year !== year) continue;
    const day = dayOfWeekMonStart(d);
    if (day > 5) continue; // Sunday — none in seed, defensive
    for (const it of s.items) {
      let cells = byRaw.get(it.rawId);
      if (!cells) {
        cells = new Array(DAYS).fill(0);
        byRaw.set(it.rawId, cells);
      }
      cells[day] += it.kg;
    }
  }

  const ordered = [...raws].sort((a, b) => a.sortOrder - b.sortOrder);
  const dayTotals = new Array(DAYS).fill(0);
  let grandTotal = 0;
  let maxV = 0;
  const rows: HeatmapRow[] = [];

  for (const raw of ordered) {
    const cells = byRaw.get(raw.id);
    if (!cells) continue;
    const total = cells.reduce((a, b) => a + b, 0);
    if (total <= 0) continue;
    for (let i = 0; i < DAYS; i++) {
      dayTotals[i] += cells[i];
      if (cells[i] > maxV) maxV = cells[i];
    }
    grandTotal += total;
    rows.push({ rawId: raw.id, name: raw.name, cells, total });
  }

  return { rows, dayTotals, grandTotal, maxV };
}

// Reference pivot-summary.jsx (PivotV2): empty cell → neutral paper; otherwise the
// raw's bg mixed to rgba with intensity 0.25 + 0.75·(v/maxV). `bg` comes pre-resolved
// from rawColor() — this util never touches the repo.
export function heatBg(bg: string, v: number, maxV: number): string {
  if (!v || maxV <= 0) return '#f8f8f5';
  const hex = bg.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const intensity = 0.25 + 0.75 * (v / maxV);
  return `rgba(${r}, ${g}, ${b}, ${intensity.toFixed(2)})`;
}
