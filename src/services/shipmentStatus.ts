import type { Role, Shipment, Status } from '@/types/domain';
import { canTransitionShipmentStatus as canTransitionPermission } from './permissions';

export function canTransitionShipmentStatus(
  role: Role,
  from: Status,
  to: Status,
): boolean {
  return canTransitionPermission(role, from, to);
}

export function nextAllowedStatuses(role: Role, s: Shipment): Status[] {
  if (s.status === 'scheduled' && role === 'admin') return ['sent'];
  if (s.status === 'sent' && (role === 'admin' || role === 'operator')) {
    return ['arrived'];
  }
  return [];
}

export type TransitionResult =
  | { ok: true; shipment: Shipment }
  | { ok: false; reason: string };

// Pure transition (no I/O). Caller persists via repo. Repo-coupled
// async variant lives in M4 when ShipmentRepo exists.
export function transitionShipment(
  s: Shipment,
  to: Status,
  role: Role,
): TransitionResult {
  if (!canTransitionShipmentStatus(role, s.status, to)) {
    return {
      ok: false,
      reason: `Переход ${s.status} → ${to} запрещён для роли ${role}`,
    };
  }
  return {
    ok: true,
    shipment: { ...s, status: to, updatedAt: new Date().toISOString() },
  };
}
