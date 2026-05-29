import type { ConcreteRepos } from '@/repos/RepoContext';
import { seedDrivers } from './drivers.seed';
import { seedPlans } from './plans.seed';
import { seedRaws } from './raws.seed';
import { seedShipments } from './shipments.seed';
import { seedSuppliers } from './suppliers.seed';
import { seedTaraTypes } from './taraTypes.seed';
import { seedTks } from './tks.seed';

const SEEDED_FLAG = 'wsm:v1:_seeded';

export async function seedIfEmpty(repos: ConcreteRepos): Promise<void> {
  if (localStorage.getItem(SEEDED_FLAG) === '1') return;

  // Sequential — FK dependency order matters.
  await seedTaraTypes(repos.taraTypes);
  await seedRaws(repos.raws);
  await seedTks(repos.tks);
  await seedSuppliers(repos.suppliers);
  await seedDrivers(repos.drivers);
  await seedShipments(repos.shipments);
  await seedPlans(repos.plans);

  localStorage.setItem(SEEDED_FLAG, '1');
}
