import { useEffect, useState, type CSSProperties, type FC } from 'react';
import { CELL_STYLES } from '@/lib/cell-state';
import type { CellState } from '@/types/domain';
import { formatTons } from '@/lib/units';
import { validatePlanInput } from '@/lib/validation';
import { Label } from '@/components/atoms/Label';
import { ProgressBar } from '@/components/atoms/ProgressBar';

interface Props {
  rawName: string;
  day: 0 | 1 | 2 | 3 | 4 | 5;
  planTons: number;
  factTons: number;
  state: CellState;
  pct: number;
  readonly: boolean;
  onPlanChange: (value: number) => void;
}

function planText(t: number): string {
  return t > 0 ? formatTons(t) : '';
}

const inputStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  fontWeight: 700,
  padding: '1px 4px',
  border: '1px solid var(--border)',
  borderRadius: 2,
  background: '#fff',
  color: 'var(--ink)',
  boxSizing: 'border-box',
};

export const PlanCell: FC<Props> = ({
  rawName,
  day,
  planTons,
  factTons,
  state,
  pct,
  readonly,
  onPlanChange,
}) => {
  const st = CELL_STYLES[state];
  const [text, setText] = useState(() => planText(planTons));

  // Resync when the saved value changes from outside (observer re-render).
  useEffect(() => {
    setText(planText(planTons));
  }, [planTons]);

  const commit = () => {
    if (readonly) return;
    if (text.trim() === '') {
      if (planTons !== 0) onPlanChange(0);
      else setText('');
      return;
    }
    const res = validatePlanInput(text);
    if ('value' in res) {
      setText(planText(res.value));
      if (res.value !== planTons) onPlanChange(res.value);
    } else {
      setText(planText(planTons)); // invalid → revert, no save
    }
  };

  const pctLabel =
    planTons > 0
      ? `${Math.round(pct)}%`
      : factTons > 0
        ? 'без плана'
        : '—';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '5px 6px',
        background: st.bg,
        border: `1px solid ${st.border}`,
        borderRadius: 3,
        minHeight: 78,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Label size={11} color="#7a7568">
          план
        </Label>
        <input
          type="text"
          inputMode="decimal"
          value={text}
          readOnly={readonly}
          placeholder="—"
          aria-label={`План: ${rawName}, день ${day + 1}, тонны`}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          style={{
            ...inputStyle,
            ...(readonly
              ? { background: 'transparent', border: '1px solid transparent', cursor: 'default' }
              : null),
          }}
        />
      </div>

      <Label size={12} mono color={st.label}>
        факт {formatTons(factTons)} т
      </Label>

      <ProgressBar
        pct={pct}
        barColor={st.bar}
        ariaLabel={`Выполнение плана: ${pctLabel}`}
      />

      <Label size={12} mono bold color={st.label}>
        {pctLabel}
      </Label>
    </div>
  );
};
