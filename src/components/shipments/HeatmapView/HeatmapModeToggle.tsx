import type { FC } from 'react';
import {
  SegmentedControl,
  type SegmentOption,
} from '@/components/atoms/SegmentedControl';

// Phase 1: only "sum" works. "avg"/"pct" are disabled placeholders (DESIGN §7).
export type HeatmapMode = 'sum' | 'avg' | 'pct';

const OPTIONS: SegmentOption<HeatmapMode>[] = [
  { value: 'sum', label: 'Сумма (кг)' },
  { value: 'avg', label: 'Среднее за день', disabled: true, title: 'Phase 2' },
  { value: 'pct', label: '% от плана недели', disabled: true, title: 'Phase 2' },
];

interface Props {
  value: HeatmapMode;
  onChange: (next: HeatmapMode) => void;
}

export const HeatmapModeToggle: FC<Props> = ({ value, onChange }) => (
  <SegmentedControl<HeatmapMode>
    ariaLabel="Режим heatmap"
    options={OPTIONS}
    value={value}
    onChange={onChange}
  />
);
