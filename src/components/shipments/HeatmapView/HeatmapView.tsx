import { useMemo, useState, type CSSProperties, type FC } from 'react';
import type { RawMaterial, Shipment } from '@/types/domain';
import { rawColor } from '@/lib/raw-colors';
import { fmtKg, fmtWeekdayShort } from '@/lib/format';
import { formatWeekLabel, weekRange } from '@/lib/week-utils';
import { Box } from '@/components/atoms/Box';
import { Label } from '@/components/atoms/Label';
import { Pill } from '@/components/atoms/Pill';
import { WeekNavigator } from '../WeekNavigator';
import { HeatmapModeToggle, type HeatmapMode } from './HeatmapModeToggle';
import { aggregateWeek, heatBg } from './heatmap-utils';

interface Props {
  shipments: Shipment[];
  raws: RawMaterial[];
  weekNum: number;
  year: number;
  onWeekChange: (weekNum: number, year: number) => void;
}

const GRID = '140px repeat(6, minmax(0, 1fr)) 96px';
const GREEN = 'var(--sidebar-active-bg)';

const headCell: CSSProperties = {
  padding: '5px 6px',
  borderRight: '1px solid #555',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const HeatmapView: FC<Props> = ({
  shipments,
  raws,
  weekNum,
  year,
  onWeekChange,
}) => {
  const [mode, setMode] = useState<HeatmapMode>('sum');

  const data = useMemo(
    () => aggregateWeek(shipments, raws, weekNum, year),
    [shipments, raws, weekNum, year],
  );

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <WeekNavigator weekNum={weekNum} year={year} onChange={onWeekChange} />
        <div style={{ flex: 1 }} />
        <HeatmapModeToggle value={mode} onChange={setMode} />
      </div>

      {data.rows.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <Label size={16} color="var(--ink-muted)">
            Нет отгрузок за эту неделю
          </Label>
        </div>
      ) : (
        <div className="wsm-scroll" style={{ overflowX: 'auto' }}>
          <Box style={{ padding: 0, minWidth: 720, overflow: 'hidden' }}>
            {/* Week banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '5px 12px',
                background: GREEN,
              }}
            >
              <Label size={15} bold color="#fff">
                {formatWeekLabel(weekNum, year)}
              </Label>
              <div style={{ flex: 1 }} />
              <Pill bg="#0d4020" color="#fff">
                Σ {fmtKg(data.grandTotal)} кг
              </Pill>
            </div>

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
                <div key={d} style={headCell}>
                  <Label size={12} bold color="#fff">
                    {d}
                  </Label>
                </div>
              ))}
              <div style={{ ...headCell, background: '#0d4020', borderRight: 'none' }}>
                <Label size={12} bold color="#fff">
                  Итого
                </Label>
              </div>
            </div>

            {/* Raw rows */}
            {data.rows.map((row) => {
              const { bg, dot } = rawColor(row.rawId, raws);
              return (
                <div
                  key={row.rawId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: GRID,
                    borderBottom: '1px solid var(--border-soft)',
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
                  {row.cells.map((v, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRight: '1px solid #fff',
                        background: heatBg(bg, v, data.maxV),
                      }}
                    >
                      <Label size={13} mono color={v ? 'var(--ink)' : '#ccc'}>
                        {v ? fmtKg(v) : '·'}
                      </Label>
                    </div>
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      padding: '4px 8px',
                      background: '#eef6ee',
                    }}
                  >
                    <Label size={14} bold mono color={GREEN}>
                      {fmtKg(row.total)}
                    </Label>
                  </div>
                </div>
              );
            })}

            {/* Day totals */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                background: GREEN,
              }}
            >
              <div
                style={{
                  padding: '5px 8px',
                  borderRight: '1px solid #0d4020',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Label size={14} bold color="#fff">
                  Σ день
                </Label>
              </div>
              {data.dayTotals.map((v, i) => (
                <div
                  key={i}
                  style={{
                    ...headCell,
                    borderRight: '1px solid #0d4020',
                  }}
                >
                  <Label size={13} bold mono color="#fff">
                    {v ? fmtKg(v) : '—'}
                  </Label>
                </div>
              ))}
              <div
                style={{
                  ...headCell,
                  background: '#0d4020',
                  borderRight: 'none',
                }}
              >
                <Label size={14} bold mono color="#fff">
                  {fmtKg(data.grandTotal)}
                </Label>
              </div>
            </div>
          </Box>
        </div>
      )}
    </div>
  );
};
