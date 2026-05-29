import { describe, it, expect } from 'vitest';
import {
  canCreateShipment,
  canEditShipmentCoreFields,
  canEditShipmentComment,
  canEditShipmentItems,
  canDeleteShipment,
  canEditWeekPlan,
  canManagePlanVisibleRaws,
  canCrudDrivers,
} from '@/services/permissions';
import type { Role, Shipment, Status, WeekPlan } from '@/types/domain';

const ROLES: Role[] = ['admin', 'operator', 'user', 'director'];

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

function makeWeekPlan(archive: boolean): WeekPlan {
  return {
    id: 'wp1',
    weekNum: 17,
    year: 2025,
    archive,
    plan: {},
    visibleRaws: [],
  };
}

describe('canCreateShipment', () => {
  it('admin only', () => {
    expect(canCreateShipment('admin')).toBe(true);
    expect(canCreateShipment('operator')).toBe(false);
    expect(canCreateShipment('user')).toBe(false);
    expect(canCreateShipment('director')).toBe(false);
  });
});

describe('canEditShipmentCoreFields', () => {
  it('admin + arrived → false (arrived blocks core edit)', () => {
    expect(canEditShipmentCoreFields('admin', makeShipment('arrived'))).toBe(
      false,
    );
  });
  it('admin + scheduled/sent → true', () => {
    expect(canEditShipmentCoreFields('admin', makeShipment('scheduled'))).toBe(
      true,
    );
    expect(canEditShipmentCoreFields('admin', makeShipment('sent'))).toBe(true);
  });
  it('non-admin → false', () => {
    for (const r of ['operator', 'user', 'director'] as Role[]) {
      expect(canEditShipmentCoreFields(r, makeShipment('scheduled'))).toBe(
        false,
      );
    }
  });
});

describe('canEditShipmentItems', () => {
  it('admin + arrived → false', () => {
    expect(canEditShipmentItems('admin', makeShipment('arrived'))).toBe(false);
  });
  it('admin + scheduled/sent → true', () => {
    expect(canEditShipmentItems('admin', makeShipment('scheduled'))).toBe(true);
    expect(canEditShipmentItems('admin', makeShipment('sent'))).toBe(true);
  });
  it('non-admin → false', () => {
    for (const r of ['operator', 'user', 'director'] as Role[]) {
      expect(canEditShipmentItems(r, makeShipment('scheduled'))).toBe(false);
    }
  });
});

describe('canEditShipmentComment', () => {
  it('admin/operator → true (any status, incl. arrived)', () => {
    expect(canEditShipmentComment('admin', makeShipment('arrived'))).toBe(true);
    expect(canEditShipmentComment('operator', makeShipment('arrived'))).toBe(
      true,
    );
  });
  it('user/director → false', () => {
    expect(canEditShipmentComment('user', makeShipment('scheduled'))).toBe(
      false,
    );
    expect(canEditShipmentComment('director', makeShipment('scheduled'))).toBe(
      false,
    );
  });
});

describe('canDeleteShipment', () => {
  it('admin only', () => {
    expect(canDeleteShipment('admin', makeShipment('scheduled'))).toBe(true);
    for (const r of ['operator', 'user', 'director'] as Role[]) {
      expect(canDeleteShipment(r, makeShipment('scheduled'))).toBe(false);
    }
  });
});

describe('canEditWeekPlan', () => {
  it('admin + non-archive → true', () => {
    expect(canEditWeekPlan('admin', makeWeekPlan(false))).toBe(true);
  });
  it('archive → false even for admin', () => {
    expect(canEditWeekPlan('admin', makeWeekPlan(true))).toBe(false);
  });
  it('non-admin → false', () => {
    for (const r of ['operator', 'user', 'director'] as Role[]) {
      expect(canEditWeekPlan(r, makeWeekPlan(false))).toBe(false);
    }
  });
});

describe('canManagePlanVisibleRaws', () => {
  it('admin + non-archive → true; archive/non-admin → false', () => {
    expect(canManagePlanVisibleRaws('admin', makeWeekPlan(false))).toBe(true);
    expect(canManagePlanVisibleRaws('admin', makeWeekPlan(true))).toBe(false);
    for (const r of ['operator', 'user', 'director'] as Role[]) {
      expect(canManagePlanVisibleRaws(r, makeWeekPlan(false))).toBe(false);
    }
  });
});

describe('canCrudDrivers', () => {
  it('admin only', () => {
    expect(canCrudDrivers('admin')).toBe(true);
    expect(canCrudDrivers('operator')).toBe(false);
    expect(canCrudDrivers('user')).toBe(false);
    expect(canCrudDrivers('director')).toBe(false);
  });
});

describe('director returns false for every permission', () => {
  it.each(ROLES)('role %s sanity baseline', (role) => {
    // Spot-check director is denied everywhere it could matter.
    if (role === 'director') {
      expect(canCreateShipment(role)).toBe(false);
      expect(canCrudDrivers(role)).toBe(false);
      expect(canDeleteShipment(role, makeShipment('scheduled'))).toBe(false);
      expect(canEditWeekPlan(role, makeWeekPlan(false))).toBe(false);
      expect(canEditShipmentComment(role, makeShipment('scheduled'))).toBe(
        false,
      );
    }
  });
});
