import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import type { RawMaterial, Role, Shipment, WeekPlan } from '@/types/domain';
import { formatLocalDate } from '@/lib/date';
import { weekRange } from '@/lib/week-utils';
import { archiveLockApplies } from '@/services/planRules';
import { canEditWeekPlan, canManagePlanVisibleRaws } from '@/services/permissions';
import { usePlanRepo } from '@/repos/RepoContext';
import { Label } from '@/components/atoms/Label';
import { Pill } from '@/components/atoms/Pill';
import { WeekNavigator } from '../WeekNavigator';
import { PlanGrid } from './PlanGrid';
import { VegVisibilityPopover } from './VegVisibilityPopover';
import { buildPlanGrid } from './plan-grid';

interface Props {
  shipments: Shipment[];
  raws: RawMaterial[];
  plans: WeekPlan[];
  weekNum: number;
  year: number;
  role: Role;
  onWeekChange: (weekNum: number, year: number) => void;
  onCreateFromPlan: (rawId: string, arrDate: string) => void;
}

const SAVE_DEBOUNCE_MS = 300;

function cloneWp(wp: WeekPlan): WeekPlan {
  const plan: Record<string, number[]> = {};
  for (const [k, v] of Object.entries(wp.plan)) plan[k] = [...v];
  return { ...wp, plan, visibleRaws: [...wp.visibleRaws] };
}

const centered = {
  display: 'flex',
  justifyContent: 'center',
  padding: 32,
} as const;

export const PlanView: FC<Props> = ({
  shipments,
  raws,
  plans,
  weekNum,
  year,
  role,
  onWeekChange,
  onCreateFromPlan,
}) => {
  const planRepo = usePlanRepo();
  const [gearOpen, setGearOpen] = useState(false);

  const wp = useMemo(
    () => plans.find((p) => p.weekNum === weekNum && p.year === year) ?? null,
    [plans, weekNum, year],
  );

  const archived = wp ? archiveLockApplies(wp) : false;
  const canEdit = wp ? canEditWeekPlan(role, wp) : false;
  const canManage = wp ? canManagePlanVisibleRaws(role, wp) : false;

  // Close the popover if it can no longer be shown (week/role/archive changed).
  useEffect(() => {
    if (!canManage) setGearOpen(false);
  }, [canManage]);

  // Debounced save accumulator. pendingRef holds the in-flight clone so multiple
  // edits within the debounce window are merged into one WeekPlan write.
  const pendingRef = useRef<WeekPlan | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const working = (): WeekPlan | null => {
    if (pendingRef.current) return pendingRef.current;
    return wp ? cloneWp(wp) : null;
  };

  const commit = (next: WeekPlan, debounce: boolean) => {
    pendingRef.current = next;
    if (timerRef.current) clearTimeout(timerRef.current);
    const doSave = () => {
      const w = pendingRef.current;
      pendingRef.current = null;
      timerRef.current = null;
      if (w) void planRepo.save(w);
    };
    if (debounce) timerRef.current = setTimeout(doSave, SAVE_DEBOUNCE_MS);
    else doSave();
  };

  const handlePlanChange = (
    rawId: string,
    day: 0 | 1 | 2 | 3 | 4 | 5,
    value: number,
  ) => {
    if (!canEdit) return; // never save archive / non-admin
    const next = working();
    if (!next) return;
    const row = next.plan[rawId] ? [...next.plan[rawId]] : [0, 0, 0, 0, 0, 0];
    while (row.length < 6) row.push(0);
    row[day] = value;
    next.plan = { ...next.plan, [rawId]: row };
    commit(next, true);
  };

  const handleToggleRaw = (rawId: string, checked: boolean) => {
    if (!canManage) return;
    const next = working();
    if (!next) return;
    if (checked) {
      if (!next.visibleRaws.includes(rawId)) next.visibleRaws = [...next.visibleRaws, rawId];
    } else {
      next.visibleRaws = next.visibleRaws.filter((id) => id !== rawId);
    }
    commit(next, false);
  };

  const data = useMemo(
    () => (wp ? buildPlanGrid(wp, shipments, raws) : null),
    [wp, shipments, raws],
  );

  // Create-from-plan: admin, non-archive only (same gate as plan editing).
  // Operator/User/archive → undefined → cell click is silent (no Form E).
  const handleCreateCell = canEdit
    ? (rawId: string, day: 0 | 1 | 2 | 3 | 4 | 5) => {
        const monday = weekRange(weekNum, year).start;
        const d = new Date(monday);
        d.setDate(monday.getDate() + day);
        onCreateFromPlan(rawId, formatLocalDate(d));
      }
    : undefined;

  const hasGrid = wp != null && wp.visibleRaws.length > 0;

  const emptyMessage = !wp
    ? 'План на эту неделю не создан.'
    : canManage
      ? 'План не создан. Отметьте овощи для планирования через ⚙'
      : 'План не создан. Обратитесь к администратору для настройки овощей недели';

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
        {archived && (
          <Pill bg="#3a3a3a" color="#fff">
            🔒 Архив
          </Pill>
        )}
        {canManage && wp && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              aria-label="Настроить видимые овощи"
              aria-expanded={gearOpen}
              onClick={() => setGearOpen((o) => !o)}
              style={{
                fontSize: 16,
                padding: '3px 10px',
                border: '2px solid var(--border)',
                borderRadius: 3,
                background: gearOpen ? 'var(--border-soft)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              ⚙
            </button>
            {gearOpen && (
              <VegVisibilityPopover
                wp={wp}
                raws={raws}
                shipments={shipments}
                onToggle={handleToggleRaw}
                onClose={() => setGearOpen(false)}
              />
            )}
          </div>
        )}
      </div>

      {hasGrid && data ? (
        <PlanGrid
          data={data}
          raws={raws}
          weekNum={weekNum}
          year={year}
          readonly={!canEdit}
          onPlanChange={handlePlanChange}
          onCreateCell={handleCreateCell}
        />
      ) : (
        <div style={centered}>
          <Label size={16} color="var(--ink-muted)">
            {emptyMessage}
          </Label>
        </div>
      )}
    </div>
  );
};
