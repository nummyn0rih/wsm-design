import type { TransportCompany } from '@/types/domain';
import { LocalStorageRepo } from './LocalStorageRepo';
import type { TKRepo } from './types';

export class LocalStorageTKRepo
  extends LocalStorageRepo<TransportCompany, void>
  implements TKRepo
{
  constructor() {
    super('wsm:v1:tks');
  }
}
