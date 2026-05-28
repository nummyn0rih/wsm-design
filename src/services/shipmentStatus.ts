import type { Role, Shipment, Status } from '@/types/domain';
import {
  canTransitionShipmentStatus,
  type StatusTransitionContext,
} from './permissions';

export { canTransitionShipmentStatus };
export type { StatusTransitionContext };

const ALL_STATUSES: Status[] = ['scheduled', 'sent', 'arrived'];

export function nextAllowedStatuses(
  role: Role,
  s: Shipment,
  context: StatusTransitionContext,
): Status[] {
  return ALL_STATUSES.filter((to) =>
    canTransitionShipmentStatus(role, s.status, to, context),
  );
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
  context: StatusTransitionContext,
): TransitionResult {
  if (!canTransitionShipmentStatus(role, s.status, to, context)) {
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
