import type { Driver } from '@/types/domain';
import { LocalStorageRepo } from './LocalStorageRepo';
import type { DriverQuery, DriverRepo } from './types';

function driverFilter(d: Driver, q: DriverQuery): boolean {
  if (q.tkId !== undefined && d.tkId !== q.tkId) return false;
  if (q.search) {
    const needle = q.search.toLowerCase();
    const hay = `${d.fio} ${d.phone}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

export class LocalStorageDriverRepo
  extends LocalStorageRepo<Driver, DriverQuery>
  implements DriverRepo
{
  constructor() {
    super('wsm:v1:drivers', driverFilter);
  }
}
