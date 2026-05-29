import type { Shipment } from '@/types/domain';
import { isoWeek, parseLocalDate } from '@/lib/date';
import { LocalStorageRepo } from './LocalStorageRepo';
import type { ShipmentQuery, ShipmentRepo } from './types';

function shipmentFilter(s: Shipment, q: ShipmentQuery): boolean {
  if (q.driverId !== undefined && s.driverId !== q.driverId) return false;
  if (q.status && q.status.length > 0 && !q.status.includes(s.status))
    return false;
  if (q.weekNum !== undefined || q.year !== undefined) {
    const { weekNum, year } = isoWeek(parseLocalDate(s.arrDate));
    if (q.weekNum !== undefined && weekNum !== q.weekNum) return false;
    if (q.year !== undefined && year !== q.year) return false;
  }
  return true;
}

export class LocalStorageShipmentRepo
  extends LocalStorageRepo<Shipment, ShipmentQuery>
  implements ShipmentRepo
{
  constructor() {
    super('wsm:v1:shipments', shipmentFilter);
  }

  async countByDriver(driverId: string): Promise<number> {
    return this.cache.filter((s) => s.driverId === driverId).length;
  }
}
