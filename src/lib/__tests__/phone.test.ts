import { describe, it, expect } from 'vitest';
import { normalizePhoneRu, formatPhoneRu } from '@/lib/phone';

describe('normalizePhoneRu', () => {
  it.each([
    '89012345678',
    '+7 901 234 56 78',
    '79012345678',
    '9012345678',
  ])('%s → +79012345678', (input) => {
    expect(normalizePhoneRu(input)).toBe('+79012345678');
  });

  it("'12345' → null", () => {
    expect(normalizePhoneRu('12345')).toBeNull();
  });
});

describe('formatPhoneRu', () => {
  it("'+79012345678' → '+7 (901) 234-56-78'", () => {
    expect(formatPhoneRu('+79012345678')).toBe('+7 (901) 234-56-78');
  });

  it('invalid passthrough', () => {
    expect(formatPhoneRu('12345')).toBe('12345');
  });
});
