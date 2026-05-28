import type { Role, Shipment, Status, WeekPlan } from '@/types/domain';

export function canCreateShipment(role: Role): boolean {
  return role === 'admin';
}

export function canEditShipmentCoreFields(role: Role, s: Shipment): boolean {
  if (s.status === 'arrived') return false;
  return role === 'admin';
}

export function canEditShipmentComment(role: Role, _s: Shipment): boolean {
  return role === 'admin' || role === 'operator';
}

export function canEditShipmentItems(role: Role, s: Shipment): boolean {
  if (s.status === 'arrived') return false;
  return role === 'admin';
}

export function canDeleteShipment(role: Role, _s: Shipment): boolean {
  return role === 'admin';
}

export function canTransitionShipmentStatus(
  role: Role,
  from: Status,
  to: Status,
): boolean {
  if (from === 'scheduled' && to === 'sent') return role === 'admin';
  if (from === 'sent' && to === 'arrived') {
    return role === 'admin' || role === 'operator';
  }
  return false;
}

export function canEditWeekPlan(role: Role, wp: WeekPlan): boolean {
  if (wp.archive) return false;
  return role === 'admin';
}

export function canManagePlanVisibleRaws(role: Role, wp: WeekPlan): boolean {
  if (wp.archive) return false;
  return role === 'admin';
}

export function canCrudDrivers(role: Role): boolean {
  return role === 'admin';
}

export { canDeleteDriver } from './driverDelete';
