import { useMemo, useState, type FC } from 'react';
import type { Driver, Role, Shipment, Status, Supplier, TransportCompany } from '@/types/domain';
import { dayOfWeekMonStart, isoWeek, parseLocalDate } from '@/lib/date';
import { Label } from '@/components/atoms/Label';
import { WeekHeader } from './WeekHeader';
import { DayHeader } from './DayHeader';
import { ShipmentRow, SHIPMENT_COLUMNS, SHIPMENT_GRID } from './ShipmentRow';

interface DayGroup {
  dayKey: string;
  dayDate: string;
  dayMonStart: number;
  rows: Shipment[];
}
interface WeekGroup {
  weekKey: string;
  weekNum: number;
  year: number;
  count: number;
  days: DayGroup[];
}

function shipWord(n: number): string {
  const m100 = n % 100;
  const m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return 'отгрузок';
  if (m10 === 1) return 'отгрузка';
  if (m10 >= 2 && m10 <= 4) return 'отгрузки';
  return 'отгрузок';
}
const countLabel = (n: number): string => `${n} ${shipWord(n)}`;

interface Props {
  shipments: Shipment[];
  statusFilter: Set<Status>;
  selectedWeekNum: number;
  selectedYear: number;
  driverMap: Map<string, Driver>;
  tkMap: Map<string, TransportCompany>;
  supplierMap: Map<string, Supplier>;
  role: Role;
}

export const TableView: FC<Props> = ({
  shipments,
  statusFilter,
  selectedWeekNum,
  selectedYear,
  driverMap,
  tkMap,
  supplierMap,
  role,
}) => {
  const weeks = useMemo<WeekGroup[]>(() => {
    const byWeek = new Map<
      string,
      { weekNum: number; year: number; days: Map<number, Shipment[]> }
    >();
    for (const s of shipments) {
      if (!statusFilter.has(s.status)) continue;
      const d = parseLocalDate(s.arrDate);
      const { weekNum, year } = isoWeek(d);
      const day = dayOfWeekMonStart(d);
      const weekKey = `${year}-${weekNum}`;
      let w = byWeek.get(weekKey);
      if (!w) {
        w = { weekNum, year, days: new Map() };
        byWeek.set(weekKey, w);
      }
      const arr = w.days.get(day);
      if (arr) arr.push(s);
      else w.days.set(day, [s]);
    }
    return Array.from(byWeek.entries())
      .map(([weekKey, w]): WeekGroup => {
        const days = Array.from(w.days.entries())
          .sort(([a], [b]) => a - b)
          .map(([dayMonStart, rows]): DayGroup => {
            const sorted = [...rows].sort(
              (x, y) => x.shipDate.localeCompare(y.shipDate) || x.id.localeCompare(y.id),
            );
            return {
              dayKey: `${weekKey}|${dayMonStart}`,
              dayDate: sorted[0].arrDate,
              dayMonStart,
              rows: sorted,
            };
          });
        return {
          weekKey,
          weekNum: w.weekNum,
          year: w.year,
          count: days.reduce((sum, d) => sum + d.rows.length, 0),
          days,
        };
      })
      .sort((a, b) => a.year - b.year || a.weekNum - b.weekNum);
  }, [shipments, statusFilter]);

  const selectedWeekKey = `${selectedYear}-${selectedWeekNum}`;
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(
    () => new Set([selectedWeekKey]),
  );
  // Days are open by default inside an expanded week; this tracks ones the user collapsed.
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(() => new Set());

  const toggleWeek = (key: string) =>
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const toggleDay = (key: string) =>
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  if (weeks.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <Label size={16} color="var(--ink-muted)">
          Нет отгрузок по выбранным фильтрам
        </Label>
      </div>
    );
  }

  return (
    <div className="wsm-scroll" style={{ overflowX: 'auto' }}>
      {weeks.map((w) => {
        const weekOpen = expandedWeeks.has(w.weekKey);
        return (
          <div key={w.weekKey}>
            <WeekHeader
              weekNum={w.weekNum}
              year={w.year}
              countLabel={countLabel(w.count)}
              expanded={weekOpen}
              onToggle={() => toggleWeek(w.weekKey)}
            />
            {weekOpen &&
              w.days.map((day) => {
                const dayOpen = !collapsedDays.has(day.dayKey);
                return (
                  <div key={day.dayKey}>
                    <DayHeader
                      dayDate={day.dayDate}
                      countLabel={countLabel(day.rows.length)}
                      open={dayOpen}
                      onToggle={() => toggleDay(day.dayKey)}
                    />
                    {dayOpen && (
                      <>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: SHIPMENT_GRID,
                            gap: 8,
                            padding: '4px 8px 0',
                          }}
                        >
                          {SHIPMENT_COLUMNS.map((c, i) => (
                            <Label
                              key={i}
                              size={11}
                              color="var(--ink-muted)"
                              style={{ textTransform: 'uppercase' }}
                            >
                              {c}
                            </Label>
                          ))}
                        </div>
                        {day.rows.map((s) => (
                          <ShipmentRow
                            key={s.id}
                            shipment={s}
                            driverName={driverMap.get(s.driverId)?.fio ?? '—'}
                            tkName={tkMap.get(s.tkId)?.name ?? '—'}
                            supplierMap={supplierMap}
                            role={role}
                          />
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};
