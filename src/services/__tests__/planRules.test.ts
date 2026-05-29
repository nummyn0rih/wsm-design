import { describe, it, expect } from 'vitest';
import {
  archiveLockApplies,
  canDeleteVisibleRaw,
  computeFactTons,
} from '@/services/planRules';
import type { Shipment, WeekPlan } from '@/types/domain';

// Week 17 2025 = Mon 2025-04-21 .. Sat 2025-04-26.
function makeWeekPlan(overrides: Partial<WeekPlan> = {}): WeekPlan {
  return {
    id: 'wp1',
    weekNum: 17,
    year: 2025,
    archive: false,
    plan: {},
    visibleRaws: ['raw1'],
    ...overrides,
  };
}

function makeShipment(arrDate: string, rawId: string, kg: number): Shipment {
  return {
    id: 's1',
    shipDate: '2025-04-20',
    arrDate,
    driverId: 'd1',
    tkId: 'tk1',
    status: 'scheduled',
    comment: '',
    items: [{ id: 'i1', rawId, kg, supplierId: 'sup1', tara: [] }],
    createdAt: '2025-04-20T00:00:00.000Z',
    updatedAt: '2025-04-20T00:00:00.000Z',
  };
}

describe('archiveLockApplies', () => {
  it('true when archive', () => {
    expect(archiveLockApplies(makeWeekPlan({ archive: true }))).toBe(true);
  });
  it('false when not archive', () => {
    expect(archiveLockApplies(makeWeekPlan({ archive: false }))).toBe(false);
  });
});

describe('canDeleteVisibleRaw', () => {
  it('false when raw has a non-zero plan ton', () => {
    const wp = makeWeekPlan({ plan: { raw1: [0, 1.5, 0, 0, 0, 0] } });
    expect(canDeleteVisibleRaw(wp, 'raw1', [])).toBe(false);
  });

  it('false when a shipment item uses the raw with arrDate inside the week', () => {
    const wp = makeWeekPlan();
    const ship = makeShipment('2025-04-22', 'raw1', 18000);
    expect(canDeleteVisibleRaw(wp, 'raw1', [ship])).toBe(false);
  });

  it('true when no plan and no in-week usage', () => {
    const wp = makeWeekPlan();
    // shipment uses raw but in a different week → no block
    const otherWeek = makeShipment('2025-05-05', 'raw1', 18000);
    expect(canDeleteVisibleRaw(wp, 'raw1', [otherWeek])).toBe(true);
  });
});

describe('computeFactTons', () => {
  it('sums matching rawId on the given day-of-week and converts to tons', () => {
    // 2025-04-21 is Monday → day 0.
    const s1 = makeShipment('2025-04-21', 'raw1', 18000);
    const s2 = makeShipment('2025-04-21', 'raw1', 2000);
    expect(computeFactTons('raw1', 0, [s1, s2])).toBe(20);
  });

  it('ignores other day-of-week and other raws', () => {
    const monday = makeShipment('2025-04-21', 'raw1', 18000); // day 0
    const tuesday = makeShipment('2025-04-22', 'raw1', 5000); // day 1
    const otherRaw = makeShipment('2025-04-21', 'raw2', 9000); // day 0, raw2
    expect(computeFactTons('raw1', 0, [monday, tuesday, otherRaw])).toBe(18);
  });
});
