import type { FC } from 'react';
import { formatWeekLabel } from '@/lib/week-utils';

interface Props {
  weekNum: number;
  year: number;
  countLabel: string;
  expanded: boolean;
  onToggle: () => void;
}

// Black accordion bar: «Неделя 17 · 21–26 апр 2025 · 10 отгрузок».
export const WeekHeader: FC<Props> = ({
  weekNum,
  year,
  countLabel,
  expanded,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={expanded}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      textAlign: 'left',
      padding: '6px 10px',
      marginTop: 8,
      background: '#1f1f1f',
      color: '#fff',
      border: 'none',
      borderRadius: 3,
      cursor: 'pointer',
      fontFamily: 'var(--font-handwriting)',
      fontSize: 16,
      fontWeight: 700,
    }}
  >
    <span aria-hidden="true" style={{ width: 14 }}>
      {expanded ? '▾' : '▸'}
    </span>
    <span>
      Неделя {weekNum} · {formatWeekLabel(weekNum, year)}
    </span>
    <span style={{ flex: 1 }} />
    <span style={{ fontWeight: 400, color: '#aaa', fontSize: 14 }}>{countLabel}</span>
  </button>
);
