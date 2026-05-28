import type { Role } from '@/types/domain';

// Minimal structural contract. Real ShipmentRepo lives in M4 (src/repos/types.ts);
// declaring just the method we need avoids coupling M3 to repos.
interface ShipmentCountByDriver {
  countByDriver(driverId: string): Promise<number>;
}

function canCrudDrivers(role: Role): boolean {
  return role === 'admin';
}

export async function canDeleteDriver(
  role: Role,
  driverId: string,
  shipmentRepo: ShipmentCountByDriver,
): Promise<boolean> {
  if (!canCrudDrivers(role)) return false;
  const count = await shipmentRepo.countByDriver(driverId);
  return count === 0;
}
