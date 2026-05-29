import type { Status } from '@/types/domain';

// Source-of-truth: docs/DESIGN.md §status-chip-palette.
export const STATUS_CHIP_STYLES: Record<
  Status,
  { bg: string; border: string; text: string }
> = {
  scheduled: { bg: '#fbf2d8', border: '#d8c068', text: '#a06000' },
  sent: { bg: '#d4e6ed', border: '#7eb0c0', text: '#1a4868' },
  arrived: { bg: '#d8ead4', border: '#7eb070', text: '#1a6b3a' },
};

export const STATUS_EMOJI: Record<Status, string> = {
  scheduled: '📅',
  sent: '🚚',
  arrived: '✓',
};
