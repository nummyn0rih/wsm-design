// ============= Enums =============

export type Role = 'admin' | 'operator' | 'user' | 'director';

export type Status = 'scheduled' | 'sent' | 'arrived';

export type CellState =
  | 'empty'
  | 'emptyOver'
  | 'short'
  | 'close'
  | 'norm'
  | 'over';

// ============= Labels (Russian display only) =============

export const STATUS_LABELS: Record<Status, string> = {
  scheduled: 'Запланировано',
  sent: 'Отправлено',
  arrived: 'Прибыло',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Админ',
  operator: 'Оператор',
  user: 'Пользователь',
  director: 'Директор',
};

// director зарезервирован, но в RoleToggle Phase 1 отсутствует.
export const PHASE1_ACTIVE_ROLES: Role[] = ['admin', 'operator', 'user'];

// ============= Validation =============

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ============= Entities =============

export interface Driver {
  id: string;
  fio: string;
  phone: string;
  tkId: string;
  info: string;
}

export interface TransportCompany {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  region?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: 'kg' | 'ton' | 'pcs' | 'box';
  bg: string;
  dot: string;
  sortOrder: number;
  allowedTara: string[];
}

export interface ShipmentItem {
  id: string;
  rawId: string;
  kg: number;
  supplierId: string;
  tara: TaraEntry[];
}

export interface Shipment {
  id: string;
  shipDate: string;
  arrDate: string;
  driverId: string;
  tkId: string;
  status: Status;
  comment: string;
  items: ShipmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WeekPlan {
  id: string;
  weekNum: number;
  year: number;
  archive: boolean;
  plan: Record<string, number[]>;
  visibleRaws: string[];
}

export interface User {
  role: Role;
}

// ============= Phase 2: Tara domain (reserved) =============

export interface TaraType {
  id: string;
  name: string;
  shortName: string;
  volumeL: number | null;
  color: string;
}

export interface TaraEntry {
  taraTypeId: string;
  count: number;
}

export interface TaraLoadNorm {
  id: string;
  supplierId: string;
  rawId: string;
  taraTypeId: string;
  fullTruckKg: number;
  fullTruckCount: number;
}

export type TaraStatus = 'in_transit' | 'delivered' | 'overdue';

export interface TaraShipmentItem {
  id: string;
  supplierId: string;
  taraTypeId: string;
  count: number;
}

export interface TaraShipment {
  id: string;
  shipDate: string;
  driverId: string;
  tkId: string;
  status: TaraStatus;
  items: TaraShipmentItem[];
  createdAt: string;
  updatedAt: string;
}
