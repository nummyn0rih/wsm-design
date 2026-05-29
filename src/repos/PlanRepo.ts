import type { WeekPlan } from '@/types/domain';
import { weekIdAtOffset } from '@/lib/week-utils';
import { LocalStorageRepo } from './LocalStorageRepo';
import type { PlanRepo, PlanSaveOptions } from './types';

export class LocalStoragePlanRepo
  extends LocalStorageRepo<WeekPlan, void>
  implements PlanRepo
{
  constructor() {
    super('wsm:v1:plans');
  }

  async save(item: WeekPlan, options?: PlanSaveOptions): Promise<void> {
    if (item.archive === true && !options?.allowArchive) {
      throw new Error(
        'archived WeekPlan: save blocked (invariant I9). Pass { allowArchive: true } from seed layer only.',
      );
    }
    return super.save(item);
  }

  async byOffset(offset: -1 | 0 | 1): Promise<WeekPlan> {
    const { weekNum, year } = weekIdAtOffset(offset);
    const found = this.cache.find(
      (p) => p.weekNum === weekNum && p.year === year,
    );
    if (!found) {
      throw new Error(
        `WeekPlan not found for offset ${offset} (W${weekNum} ${year})`,
      );
    }
    return found;
  }
}
