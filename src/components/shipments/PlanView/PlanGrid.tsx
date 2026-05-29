import { useMemo, type CSSProperties, type FC } from 'react';
import type { RawMaterial } from '@/types/domain';
import { rawColor } from '@/lib/raw-colors';
import { formatTons } from '@/lib/units';
import { fmtWeekdayShort } from '@/lib/format';
import { weekRange } from '@/lib/week-utils';
import { Box } from '@/components/atoms/Box';
import { Label } from '@/components/atoms/Label';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { PlanCell } from './PlanCell';
import type { PlanGridData } from './plan-grid';

interface Props {
  data: PlanGridData;
  raws: RawMaterial[];
  weekNum: number;
  year: number;
  readonly: boolean;
  onPlanChange: (rawId: string, day: 0 | 1 | 2 | 3 | 4 | 5, value: number) => void;
}

const GRID = '150px repeat(6, minmax(96px, 1fr))';

const headCell: CSSProperties = {
  padding: '5px 6px',
  borderRight: '1px solid #555',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const PlanGrid: FC<Props> = ({
  data,
  raws,
  weekNum,
  year,
  readonly,
  onPlanChange,
}) => {
  const dayLabels = useMemo(() => {
    const monday = weekRange(weekNum, year).start;
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return `${fmtWeekdayShort(d)} ${d.getDate()}`;
    });
  }, [weekNum, year]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="wsm-scroll" style={{ overflowX: 'auto' }}>
        <Box style={{ padding: 0, minWidth: 720, overflow: 'hidden' }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              background: 'var(--ink)',
            }}
          >
            <div style={{ ...headCell, justifyContent: 'flex-start' }}>
              <Label size={12} bold color="#fff">
                Сырьё
              </Label>
            </div>
            {dayLabels.map((d) => (
              <div key={d} style={{ ...headCell, borderRight: 'none' }}>
                <Label size={12} bold color="#fff">
                  {d}
                </Label>
              </div>
            ))}
          </div>

          {/* Raw rows */}
          {data.rows.map((row) => {
            const { dot } = rawColor(row.rawId, raws);
            return (
              <div
                key={row.rawId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  borderBottom: '1px solid var(--border-soft)',
                  alignItems: 'stretch',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 8px',
                    borderRight: '1px solid var(--border-soft)',
                    background: '#fff',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: dot,
                      flexShrink: 0,
                    }}
                  />
                  <Label size={14} bold>
                    {row.name}
                  </Label>
                </div>
                {row.cells.map((c) => (
                  <div key={c.day} style={{ padding: 3 }}>
                    <PlanCell
                      rawName={row.name}
                      day={c.day}
                      planTons={c.planTons}
                      factTons={c.factTons}
                      state={c.state}
                      pct={c.pct}
                      readonly={readonly}
                      onPlanChange={(v) => onPlanChange(row.rawId, c.day, v)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </Box>
      </div>

      {/* Week totals footer */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '10px 14px',
          flexWrap: 'wrap',
        }}
      >
        <Label size={14} bold>
          Итого за неделю
        </Label>
        <Label size={14} mono>
          План: {formatTons(data.totalPlan)} т
        </Label>
        <Label size={14} mono>
          Факт: {formatTons(data.totalFact)} т
        </Label>
        <Label size={14} mono bold>
          {data.totalPlan > 0 ? `${Math.round(data.pct)}%` : '—'}
        </Label>
        <div style={{ flex: 1, minWidth: 160 }}>
          <ProgressBar
            pct={data.pct}
            barColor="var(--sidebar-active-bg)"
            ariaLabel="Общее выполнение плана недели"
          />
        </div>
      </Box>
    </div>
  );
};
