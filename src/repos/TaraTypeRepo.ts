import type { TaraType } from '@/types/domain';
import { LocalStorageRepo } from './LocalStorageRepo';
import { ReadOnlyRepoError, type TaraTypeRepo } from './types';

export class LocalStorageTaraTypeRepo
  extends LocalStorageRepo<TaraType, void>
  implements TaraTypeRepo
{
  constructor() {
    super('wsm:v1:taraTypes');
  }

  async save(): Promise<void> {
    throw new ReadOnlyRepoError('TaraType');
  }

  async delete(): Promise<void> {
    throw new ReadOnlyRepoError('TaraType');
  }

  // Seed-only write path. Called from data/seed/taraTypes.seed.ts which imports
  // this concrete class type (not the TaraTypeRepo interface).
  async _seedWrite(items: TaraType[]): Promise<void> {
    this.replaceAll(items);
  }
}
