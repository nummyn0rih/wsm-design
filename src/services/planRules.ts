import type { Shipment, WeekPlan } from '@/types/domain';
import { isoWeek, parseLocalDate, dayOfWeekMonStart } from '@/lib/date';
import { kgToTons } from '@/lib/units';

export function archiveLockApplies(wp: WeekPlan): boolean {
  return wp.archive === true;
}

// I10: cannot hide rawId from visibleRaws if it has non-zero plan
// or any ShipmentItem with arrDate inside this week.
export function canDeleteVisibleRaw(
  wp: WeekPlan,
  rawId: string,
  shipments: Shipment[],
): boolean {
  if (wp.plan[rawId]?.some((t) => t > 0)) return false;
  const usedInWeek = shipments.some((s) => {
    const { weekNum, year } = isoWeek(parseLocalDate(s.arrDate));
    if (weekNum !== wp.weekNum || year !== wp.year) return false;
    return s.items.some((i) => i.rawId === rawId);
  });
  return !usedInWeek;
}

// Sum kg for given rawId on given day-of-week (0=Mon..5=Sat) across week shipments,
// across all 3 statuses (fact = scheduled + sent + arrived).
export function computeFactTons(
  rawId: string,
  day: 0 | 1 | 2 | 3 | 4 | 5,
  weekShipments: Shipment[],
): number {
  let kg = 0;
  for (const s of weekShipments) {
    if (dayOfWeekMonStart(parseLocalDate(s.arrDate)) !== day) continue;
    for (const it of s.items) {
      if (it.rawId === rawId) kg += it.kg;
    }
  }
  return kgToTons(kg);
}
