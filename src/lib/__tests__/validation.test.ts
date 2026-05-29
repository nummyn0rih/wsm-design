import { describe, it, expect } from 'vitest';
import {
  validateShipment,
  validateDriver,
  validatePlanInput,
} from '@/lib/validation';
import type { Driver, Shipment, ShipmentItem } from '@/types/domain';

function makeItem(overrides: Partial<ShipmentItem> = {}): ShipmentItem {
  return {
    id: 'i1',
    rawId: 'raw1',
    kg: 18000,
    supplierId: 'sup1',
    tara: [],
    ...overrides,
  };
}

// Baseline valid shipment. arrDate 2025-04-21 (Monday) — never Sunday.
function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 's1',
    shipDate: '2025-04-21',
    arrDate: '2025-04-22',
    driverId: 'd1',
    tkId: 'tk1',
    status: 'scheduled',
    comment: '',
    items: [makeItem()],
    createdAt: '2025-04-20T00:00:00.000Z',
    updatedAt: '2025-04-20T00:00:00.000Z',
    ...overrides,
  };
}

function makeDriver(overrides: Partial<Driver> = {}): Driver {
  return {
    id: 'd1',
    fio: 'Иванов Иван',
    phone: '+79012345678',
    tkId: 'tk1',
    info: '',
    ...overrides,
  };
}

describe('validateShipment', () => {
  it('valid shipment has no errors', () => {
    expect(validateShipment(makeShipment())).toEqual([]);
  });

  it('empty items → I1', () => {
    const errors = validateShipment(makeShipment({ items: [] }));
    expect(errors.some((e) => e.code === 'I1')).toBe(true);
  });

  it('kg=0 → I3', () => {
    const errors = validateShipment(
      makeShipment({ items: [makeItem({ kg: 0 })] }),
    );
    expect(errors.some((e) => e.code === 'I3')).toBe(true);
  });

  it('missing driverId → I4', () => {
    const errors = validateShipment(makeShipment({ driverId: '' }));
    expect(errors.some((e) => e.code === 'I4')).toBe(true);
  });

  it('arrDate < shipDate → I2', () => {
    const errors = validateShipment(
      makeShipment({ shipDate: '2025-04-22', arrDate: '2025-04-21' }),
    );
    expect(errors.some((e) => e.code === 'I2')).toBe(true);
  });

  it('Sunday arrDate → I21', () => {
    // 2025-04-27 is a Sunday.
    const errors = validateShipment(makeShipment({ arrDate: '2025-04-27' }));
    expect(errors.some((e) => e.code === 'I21')).toBe(true);
  });
});

describe('validateDriver', () => {
  it('valid driver has no errors', () => {
    expect(validateDriver(makeDriver())).toEqual([]);
  });

  it('short fio → I14', () => {
    const errors = validateDriver(makeDriver({ fio: 'И' }));
    expect(errors.some((e) => e.code === 'I14')).toBe(true);
  });

  it('bad phone → I13', () => {
    const errors = validateDriver(makeDriver({ phone: '12345' }));
    expect(errors.some((e) => e.code === 'I13')).toBe(true);
  });

  it('missing tkId → error', () => {
    const errors = validateDriver(makeDriver({ tkId: '' }));
    expect(errors.some((e) => e.field === 'tkId')).toBe(true);
  });

  it('info > 500 chars → error', () => {
    const errors = validateDriver(makeDriver({ info: 'x'.repeat(501) }));
    expect(errors.some((e) => e.field === 'info')).toBe(true);
  });
});

describe('validatePlanInput', () => {
  it('negative → error', () => {
    expect(validatePlanInput(-1)).toEqual({
      error: 'План не может быть отрицательным',
    });
  });

  it('NaN string → error', () => {
    expect(validatePlanInput('abc')).toEqual({ error: 'Введите число' });
  });

  it('empty string → error', () => {
    expect(validatePlanInput('')).toEqual({ error: 'Введите число' });
  });

  it('step 0.1 normalization', () => {
    expect(validatePlanInput('1.234')).toEqual({ value: 1.2 });
  });

  it('comma input normalized', () => {
    expect(validatePlanInput('1,5')).toEqual({ value: 1.5 });
  });
});
