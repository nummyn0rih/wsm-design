import { describe, it, expect } from 'vitest';
import {
  parseTonsInput,
  formatTons,
  kgToTons,
  tonsToKg,
  roundToStep,
} from '@/lib/units';

describe('parseTonsInput', () => {
  it("'1,5' → 1.5 (comma)", () => {
    expect(parseTonsInput('1,5')).toBe(1.5);
  });
  it("'1.5' → 1.5 (dot)", () => {
    expect(parseTonsInput('1.5')).toBe(1.5);
  });
  it("'' → null", () => {
    expect(parseTonsInput('')).toBeNull();
  });
  it("'abc' → null", () => {
    expect(parseTonsInput('abc')).toBeNull();
  });
});

describe('formatTons', () => {
  it('ru-RU 1.5 → "1,5"', () => {
    expect(formatTons(1.5)).toBe('1,5');
  });
});

describe('kgToTons / tonsToKg', () => {
  it('kgToTons(18000) → 18', () => {
    expect(kgToTons(18000)).toBe(18);
  });
  it('tonsToKg(1.5) → 1500', () => {
    expect(tonsToKg(1.5)).toBe(1500);
  });
});

describe('roundToStep', () => {
  it('roundToStep(1.234, 0.1) → 1.2', () => {
    expect(roundToStep(1.234, 0.1)).toBe(1.2);
  });
});
