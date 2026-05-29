import type { RawMaterial } from '@/types/domain';
import { LocalStorageRepo } from './LocalStorageRepo';
import type { RawRepo } from './types';

export class LocalStorageRawRepo
  extends LocalStorageRepo<RawMaterial, void>
  implements RawRepo
{
  constructor() {
    super('wsm:v1:raws');
  }
}
