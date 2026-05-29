import { describe, it, expect } from 'vitest';
import {
  canTransitionShipmentStatus,
  nextAllowedStatuses,
  transitionShipment,
} from '@/services/shipmentStatus';
import type { Role, Shipment, Status } from '@/types/domain';

function makeShipment(status: Status): Shipment {
  return {
    id: 's1',
    shipDate: '2025-04-21',
    arrDate: '2025-04-22',
    driverId: 'd1',
    tkId: 'tk1',
    status,
    comment: '',
    items: [],
    createdAt: '2025-04-20T00:00:00.000Z',
    updatedAt: '2025-04-20T00:00:00.000Z',
  };
}

const ROLES: Role[] = ['admin', 'operator', 'user', 'director'];

describe('canTransitionShipmentStatus — allowed', () => {
  it('admin scheduled→sent → true', () => {
    expect(
      canTransitionShipmentStatus('admin', 'scheduled', 'sent', 'formE'),
    ).toBe(true);
  });
  it('admin sent→arrived → true (any context)', () => {
    expect(
      canTransitionShipmentStatus('admin', 'sent', 'arrived', 'tableView'),
    ).toBe(true);
    expect(
      canTransitionShipmentStatus('admin', 'sent', 'arrived', 'formE'),
    ).toBe(true);
  });
  it('operator sent→arrived → true only in tableView', () => {
    expect(
      canTransitionShipmentStatus('operator', 'sent', 'arrived', 'tableView'),
    ).toBe(true);
    expect(
      canTransitionShipmentStatus('operator', 'sent', 'arrived', 'formE'),
    ).toBe(false);
  });
});

describe('canTransitionShipmentStatus — forbidden', () => {
  it('admin scheduled→arrived → false (no direct jump)', () => {
    expect(
      canTransitionShipmentStatus('admin', 'scheduled', 'arrived', 'tableView'),
    ).toBe(false);
    expect(
      canTransitionShipmentStatus('admin', 'scheduled', 'arrived', 'formE'),
    ).toBe(false);
  });

  it('operator scheduled→sent → false', () => {
    expect(
      canTransitionShipmentStatus('operator', 'scheduled', 'sent', 'tableView'),
    ).toBe(false);
  });

  it('user → false for every transition', () => {
    expect(
      canTransitionShipmentStatus('user', 'scheduled', 'sent', 'tableView'),
    ).toBe(false);
    expect(
      canTransitionShipmentStatus('user', 'sent', 'arrived', 'tableView'),
    ).toBe(false);
  });

  it('all reverse transitions → false for every role/context', () => {
    const reverse: [Status, Status][] = [
      ['sent', 'scheduled'],
      ['arrived', 'sent'],
      ['arrived', 'scheduled'],
    ];
    for (const role of ROLES) {
      for (const [from, to] of reverse) {
        expect(
          canTransitionShipmentStatus(role, from, to, 'tableView'),
        ).toBe(false);
        expect(canTransitionShipmentStatus(role, from, to, 'formE')).toBe(
          false,
        );
      }
    }
  });
});

describe('nextAllowedStatuses', () => {
  it('admin scheduled (formE) → [sent]', () => {
    expect(
      nextAllowedStatuses('admin', makeShipment('scheduled'), 'formE'),
    ).toEqual(['sent']);
  });
  it('user → []', () => {
    expect(
      nextAllowedStatuses('user', makeShipment('scheduled'), 'tableView'),
    ).toEqual([]);
  });
});

describe('transitionShipment', () => {
  it('allowed → ok with updated status', () => {
    const res = transitionShipment(
      makeShipment('sent'),
      'arrived',
      'admin',
      'tableView',
    );
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.shipment.status).toBe('arrived');
  });

  it('forbidden → ok:false with reason', () => {
    const res = transitionShipment(
      makeShipment('scheduled'),
      'arrived',
      'admin',
      'tableView',
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toContain('запрещён');
  });
});
