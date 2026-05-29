import type { Supplier } from '@/types/domain';
import { LocalStorageRepo } from './LocalStorageRepo';
import type { SupplierRepo } from './types';

export class LocalStorageSupplierRepo
  extends LocalStorageRepo<Supplier, void>
  implements SupplierRepo
{
  constructor() {
    super('wsm:v1:suppliers');
  }
}
