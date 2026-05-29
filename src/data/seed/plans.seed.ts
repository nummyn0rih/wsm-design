import type { WeekPlan } from '@/types/domain';
import type { PlanRepo } from '@/repos/types';
import { weekIdAtOffset } from '@/lib/week-utils';

function planId(weekNum: number, year: number): string {
  return `W${weekNum}_${year}`;
}

// 6 daily slots Mon..Sat in tons. Helper for readability.
function row(...vals: number[]): number[] {
  const r = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < vals.length && i < 6; i += 1) r[i] = vals[i];
  return r;
}

// Current-week plan engineered for S1 (all 6 cell states on Monday):
//   raw_cucumber  Mon plan=10, shipment fact=5    → short
//   raw_tomato    Mon plan=10, shipment fact=8.5  → close
//   raw_cherry    Mon plan=10, shipment fact=10.5 → norm
//   raw_patisson  Mon plan=10, shipment fact=13   → over
//   raw_pepper_hot Mon plan=0, shipment fact=3    → emptyOver
//   raw_jalapeno  Mon plan=0,  no shipment        → empty (raw still in visibleRaws)
//
// visibleRaws for current week intentionally larger than the set of raws with
// shipments (S7 heatmap auto-filter test). Includes raw_jalapeno (free of
// shipment/plan on Mon → "empty" cell) and others used Tue–Fri.
function currentPlan(): WeekPlan {
  const { weekNum, year } = weekIdAtOffset(0);
  return {
    id: planId(weekNum, year),
    weekNum,
    year,
    archive: false,
    plan: {
      raw_cucumber: row(10, 5, 0, 0, 0, 0),
      raw_tomato: row(10, 0, 6, 0, 0, 0),
      raw_cherry: row(10, 0, 0, 0, 0, 0),
      raw_patisson: row(10, 0, 0, 0, 0, 0),
      raw_jalapeno: row(0, 0, 0, 0, 0, 0),
      raw_pepper_hot: row(0, 0, 0, 0, 0, 0),
      raw_onion: row(0, 2, 0, 0, 0, 0),
      raw_carrot: row(0, 0, 0, 3, 0, 0),
      raw_beetroot: row(0, 0, 0, 0, 1.5, 0),
      raw_cabbage: row(0, 0, 3, 0, 0, 0),
    },
    visibleRaws: [
      'raw_cucumber',
      'raw_tomato',
      'raw_cherry',
      'raw_patisson',
      'raw_jalapeno',
      'raw_pepper_hot',
      'raw_onion',
      'raw_carrot',
      'raw_beetroot',
      'raw_cabbage',
    ],
  };
}

function previousPlan(): WeekPlan {
  const { weekNum, year } = weekIdAtOffset(-1);
  return {
    id: planId(weekNum, year),
    weekNum,
    year,
    archive: true,
    plan: {
      raw_cucumber: row(8, 0, 0, 0, 0, 0),
      raw_tomato: row(10, 0, 0, 0, 0, 0),
      raw_cherry: row(0, 6, 0, 0, 0, 0),
      raw_patisson: row(0, 8, 0, 0, 0, 0),
      raw_jalapeno: row(0, 0, 2, 0, 0, 0),
      raw_onion: row(0, 0, 3.5, 0, 0, 0),
      raw_carrot: row(0, 0, 0, 4, 0, 0),
      raw_beetroot: row(0, 0, 0, 2, 0, 0),
      raw_potato: row(0, 0, 0, 0, 5, 0),
      raw_cabbage: row(0, 0, 0, 0, 0, 2.5),
    },
    visibleRaws: [
      'raw_cucumber',
      'raw_tomato',
      'raw_cherry',
      'raw_patisson',
      'raw_jalapeno',
      'raw_onion',
      'raw_carrot',
      'raw_beetroot',
      'raw_potato',
      'raw_cabbage',
    ],
  };
}

function nextPlan(): WeekPlan {
  const { weekNum, year } = weekIdAtOffset(1);
  return {
    id: planId(weekNum, year),
    weekNum,
    year,
    archive: false,
    plan: {
      raw_cucumber: row(6, 0, 0, 0, 0, 0),
      raw_tomato: row(7, 0, 0, 0, 0, 0),
      raw_cherry: row(0, 5, 0, 0, 0, 0),
      raw_patisson: row(0, 5, 0, 0, 0, 0),
      raw_pepper_sweet: row(0, 0, 3, 0, 0, 0),
      raw_onion: row(0, 0, 2, 0, 0, 0),
      raw_carrot: row(0, 0, 0, 3.5, 0, 0),
      raw_beetroot: row(0, 0, 0, 2, 0, 0),
      raw_potato: row(0, 0, 0, 0, 4.5, 0),
      raw_cabbage: row(0, 0, 0, 0, 0, 3.5),
    },
    visibleRaws: [
      'raw_cucumber',
      'raw_tomato',
      'raw_cherry',
      'raw_patisson',
      'raw_pepper_sweet',
      'raw_onion',
      'raw_carrot',
      'raw_beetroot',
      'raw_potato',
      'raw_cabbage',
    ],
  };
}

export async function seedPlans(repo: PlanRepo): Promise<void> {
  await repo.save(previousPlan(), { allowArchive: true });
  await repo.save(currentPlan());
  await repo.save(nextPlan());
}
