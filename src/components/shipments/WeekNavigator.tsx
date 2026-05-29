import type { CSSProperties, FC } from 'react';
import { currentWeekId } from '@/lib/date';
import { formatWeekLabel, weekAtDelta } from '@/lib/week-utils';
import { Label } from '@/components/atoms/Label';

// Shared week selector for Heatmap (M7) and Plan (M8). Source of truth is the page
// state passed in via props; the parent maps onChange to the URL (replaceState).
interface Props {
  weekNum: number;
  year: number;
  onChange: (weekNum: number, year: number) => void;
}

const btnStyle: CSSProperties = {
  fontFamily: 'var(--font-handwriting)',
  fontSize: 14,
  fontWeight: 700,
  padding: '3px 12px',
  border: '2px solid var(--border)',
  borderRadius: 3,
  background: 'transparent',
  color: 'var(--ink)',
  cursor: 'pointer',
};

export const WeekNavigator: FC<Props> = ({ weekNum, year, onChange }) => {
  const prev = () => {
    const w = weekAtDelta(weekNum, year, -1);
    onChange(w.weekNum, w.year);
  };
  const next = () => {
    const w = weekAtDelta(weekNum, year, 1);
    onChange(w.weekNum, w.year);
  };
  const today = () => {
    const w = currentWeekId();
    onChange(w.weekNum, w.year);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button type="button" onClick={prev} style={btnStyle} aria-label="Предыдущая неделя">
        ← Пред
      </button>
      <button type="button" onClick={today} style={btnStyle}>
        Сегодня
      </button>
      <button type="button" onClick={next} style={btnStyle} aria-label="Следующая неделя">
        След →
      </button>
      <Label size={15} bold style={{ marginLeft: 4 }}>
        Неделя {weekNum} · {formatWeekLabel(weekNum, year)}
      </Label>
    </div>
  );
};
