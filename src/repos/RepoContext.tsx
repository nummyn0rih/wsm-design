import { createContext, useContext, type FC, type ReactNode } from 'react';
import type { LocalStorageDriverRepo } from './DriverRepo';
import type { LocalStoragePlanRepo } from './PlanRepo';
import type { LocalStorageRawRepo } from './RawRepo';
import type { LocalStorageShipmentRepo } from './ShipmentRepo';
import type { LocalStorageSupplierRepo } from './SupplierRepo';
import type { LocalStorageTaraTypeRepo } from './TaraTypeRepo';
import type { LocalStorageTKRepo } from './TKRepo';
import type {
  DriverRepo,
  PlanRepo,
  RawRepo,
  ShipmentRepo,
  SupplierRepo,
  TaraTypeRepo,
  TKRepo,
} from './types';

export interface Repos {
  shipments: ShipmentRepo;
  drivers: DriverRepo;
  tks: TKRepo;
  suppliers: SupplierRepo;
  raws: RawRepo;
  plans: PlanRepo;
  taraTypes: TaraTypeRepo;
}

// Concrete bundle for seed layer (needs LocalStorageTaraTypeRepo._seedWrite
// without a cast). Assignable to Repos since each class implements its iface.
export interface ConcreteRepos {
  shipments: LocalStorageShipmentRepo;
  drivers: LocalStorageDriverRepo;
  tks: LocalStorageTKRepo;
  suppliers: LocalStorageSupplierRepo;
  raws: LocalStorageRawRepo;
  plans: LocalStoragePlanRepo;
  taraTypes: LocalStorageTaraTypeRepo;
}

const RepoContext = createContext<Repos | null>(null);

export const RepoProvider: FC<{ value: Repos; children: ReactNode }> = ({
  value,
  children,
}) => <RepoContext.Provider value={value}>{children}</RepoContext.Provider>;

function useRepos(): Repos {
  const r = useContext(RepoContext);
  if (!r) throw new Error('useRepos must be used inside <RepoProvider>');
  return r;
}

export const useShipmentRepo = (): ShipmentRepo => useRepos().shipments;
export const useDriverRepo = (): DriverRepo => useRepos().drivers;
export const useTKRepo = (): TKRepo => useRepos().tks;
export const useSupplierRepo = (): SupplierRepo => useRepos().suppliers;
export const useRawRepo = (): RawRepo => useRepos().raws;
export const usePlanRepo = (): PlanRepo => useRepos().plans;
export const useTaraTypeRepo = (): TaraTypeRepo => useRepos().taraTypes;
