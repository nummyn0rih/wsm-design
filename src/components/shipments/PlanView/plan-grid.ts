import type { CellState, RawMaterial, Shipment, WeekPlan } from '@/types/domain';
import { isoWeek, parseLocalDate } from '@/lib/date';
import { getCellState } from '@/lib/cell-state';
import { computeFactTons } from '@/services/planRules';

export interface PlanCellData {
  day: 0 | 1 | 2 | 3 | 4 | 5;
  planTons: number;
  factTons: number;
  state: CellState;
  /** fact/plan*100, 0 when planTons<=0 */
  pct: number;
}

export interface PlanRowData {
  rawId: string;
  name: string;
  cells: PlanCellData[]; // length 6, Mon..Sat
  rowPlan: number;
  rowFact: number;
}

export interface PlanGridData {
  rows: PlanRowData[];
  totalPlan: number;
  totalFact: number;
  /** overall fact/plan*100, 0 when totalPlan<=0 */
  pct: number;
}

const DAYS = [0, 1, 2, 3, 4, 5] as const;

// Builds the visibleRaws × 6-day grid for a WeekPlan. Plan tons come from
// wp.plan[rawId][day]; fact tons aggregate all 3 shipment statuses via the
// existing service helper. Rows follow RawMaterial.sortOrder ASC. Pure — no repo.
export function buildPlanGrid(
  wp: WeekPlan,
  shipments: Shipment[],
  raws: RawMaterial[],
): PlanGridData {
  const weekShipments = shipments.filter((s) => {
    const w = isoWeek(parseLocalDate(s.arrDate));
    return w.weekNum === wp.weekNum && w.year === wp.year;
  });

  const rawById = new Map(raws.map((r) => [r.id, r]));
  const visible = wp.visibleRaws
    .map((id) => rawById.get(id))
    .filter((r): r is RawMaterial => r != null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  let totalPlan = 0;
  let totalFact = 0;

  const rows: PlanRowData[] = visible.map((raw) => {
    const planRow = wp.plan[raw.id] ?? [];
    let rowPlan = 0;
    let rowFact = 0;
    const cells: PlanCellData[] = DAYS.map((day) => {
      const planTons = planRow[day] ?? 0;
      const factTons = computeFactTons(raw.id, day, weekShipments);
      rowPlan += planTons;
      rowFact += factTons;
      const state = getCellState(planTons, factTons);
      const pct = planTons > 0 ? (factTons / planTons) * 100 : 0;
      return { day, planTons, factTons, state, pct };
    });
    totalPlan += rowPlan;
    totalFact += rowFact;
    return { rawId: raw.id, name: raw.name, cells, rowPlan, rowFact };
  });

  const pct = totalPlan > 0 ? (totalFact / totalPlan) * 100 : 0;
  return { rows, totalPlan, totalFact, pct };
}
