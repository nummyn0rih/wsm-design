import type { FC } from 'react';
import { SegmentedControl } from '@/components/atoms/SegmentedControl';

export type ViewMode = 'table' | 'heatmap' | 'plan';

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'table', label: 'Таблица' },
  { value: 'heatmap', label: 'Heatmap' },
  { value: 'plan', label: 'План' },
];

interface Props {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}

export const ViewModeToggle: FC<Props> = ({ value, onChange }) => (
  <SegmentedControl<ViewMode>
    ariaLabel="Режим просмотра"
    options={OPTIONS}
    value={value}
    onChange={onChange}
  />
);
