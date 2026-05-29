import type { FC } from 'react';
import { STATUS_LABELS, type Status } from '@/types/domain';
import { Label } from '@/components/atoms/Label';

const STATUSES: Status[] = ['scheduled', 'sent', 'arrived'];

interface Props {
  value: Set<Status>;
  onChange: (next: Set<Status>) => void;
}

// Status checkboxes only. Period dropdown removed in v1.3 (Phase 2 backlog).
export const TableFilters: FC<Props> = ({ value, onChange }) => {
  const toggle = (s: Status) => {
    const next = new Set(value);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange(next);
  };
  return (
    <div
      role="group"
      aria-label="Фильтр по статусу"
      style={{ display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <Label size={13} color="var(--ink-muted)" style={{ fontStyle: 'italic' }}>
        Статус:
      </Label>
      {STATUSES.map((s) => (
        <label
          key={s}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={value.has(s)}
            onChange={() => toggle(s)}
          />
          <Label size={14}>{STATUS_LABELS[s]}</Label>
        </label>
      ))}
    </div>
  );
};
