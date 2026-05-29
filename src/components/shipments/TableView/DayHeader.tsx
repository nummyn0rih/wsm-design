import type { FC } from 'react';
import { fmtDayMon, fmtWeekdayShort } from '@/lib/format';

interface Props {
  dayDate: string; // arrDate of the day group (ISO 'YYYY-MM-DD')
  countLabel: string;
  open: boolean;
  onToggle: () => void;
}

// Dark-gray accordion bar: «ПН 21 апр · 4 отгрузки».
export const DayHeader: FC<Props> = ({ dayDate, countLabel, open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={open}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      textAlign: 'left',
      padding: '4px 10px',
      marginTop: 4,
      background: '#3a3a3a',
      color: '#e8e5df',
      border: 'none',
      borderRadius: 3,
      cursor: 'pointer',
      fontFamily: 'var(--font-handwriting)',
      fontSize: 14,
      fontWeight: 700,
    }}
  >
    <span aria-hidden="true" style={{ width: 12 }}>
      {open ? '▾' : '▸'}
    </span>
    <span>
      {fmtWeekdayShort(dayDate)} {fmtDayMon(dayDate)}
    </span>
    <span style={{ flex: 1 }} />
    <span style={{ fontWeight: 400, color: '#aaa', fontSize: 13 }}>{countLabel}</span>
  </button>
);
