import type { RawMaterial } from '@/types/domain';

// Single source of truth is RawMaterial.bg / RawMaterial.dot from seed.
// This helper reads from the passed-in raws array — no local RAW_COLORS map.
export function rawColor(
  rawId: string,
  raws: RawMaterial[],
): { bg: string; dot: string } {
  const r = raws.find((x) => x.id === rawId);
  if (!r) return { bg: '#eee', dot: '#999' };
  return { bg: r.bg, dot: r.dot };
}
