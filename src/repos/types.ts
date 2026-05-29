import type {
  Driver,
  RawMaterial,
  Shipment,
  Status,
  Supplier,
  TaraType,
  TransportCompany,
  WeekPlan,
} from '@/types/domain';

export interface CrudRepo<T extends { id: string }, Q = void> {
  list(query?: Q): Promise<T[]>;
  listSync(query?: Q): T[];
  get(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}

export interface DriverQuery {
  search?: string;
  tkId?: string;
}
export type DriverRepo = CrudRepo<Driver, DriverQuery>;

export interface ShipmentQuery {
  weekNum?: number;
  year?: number;
  status?: Status[];
  driverId?: string;
}
export interface ShipmentRepo extends CrudRepo<Shipment, ShipmentQuery> {
  countByDriver(driverId: string): Promise<number>;
}

export interface PlanSaveOptions {
  allowArchive?: boolean;
}
export interface PlanRepo extends Omit<CrudRepo<WeekPlan, void>, 'save'> {
  save(item: WeekPlan, options?: PlanSaveOptions): Promise<void>;
  byOffset(offset: -1 | 0 | 1): Promise<WeekPlan>;
}

export type TKRepo = CrudRepo<TransportCompany, void>;
export type SupplierRepo = CrudRepo<Supplier, void>;
export type RawRepo = CrudRepo<RawMaterial, void>;
export type TaraTypeRepo = CrudRepo<TaraType, void>;

export class ReadOnlyRepoError extends Error {
  constructor(entity: string) {
    super(`${entity} is read-only`);
    this.name = 'ReadOnlyRepoError';
  }
}
