import { useMemo, useState, type FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Driver, Status, Supplier, TransportCompany } from '@/types/domain';
import { currentWeekId } from '@/lib/date';
import { useRole } from '@/context/RoleContext';
import { canCreateShipment } from '@/services/permissions';
import {
  useDriverRepo,
  useShipmentRepo,
  useSupplierRepo,
  useTKRepo,
} from '@/repos/RepoContext';
import { useRepoSnapshot } from '@/repos/useRepoSnapshot';
import { Box } from '@/components/atoms/Box';
import { Label } from '@/components/atoms/Label';
import { ViewModeToggle, type ViewMode } from './ViewModeToggle';
import { TableFilters } from './TableView/TableFilters';
import { TableView } from './TableView/TableView';

const ALL_STATUSES: Status[] = ['scheduled', 'sent', 'arrived'];

function parseView(v: string | null): ViewMode {
  return v === 'heatmap' || v === 'plan' ? v : 'table';
}

const PLACEHOLDER_LABEL: Record<Exclude<ViewMode, 'table'>, string> = {
  heatmap: 'Heatmap — раздел в работе (M7)',
  plan: 'План — раздел в работе (M8)',
};

export const ShipmentsPage: FC = () => {
  const { role } = useRole();
  const [params, setParams] = useSearchParams();

  const view = parseView(params.get('view'));
  const cur = currentWeekId();
  const weekNum = Number(params.get('week')) || cur.weekNum;
  const year = Number(params.get('year')) || cur.year;

  const setView = (next: ViewMode) =>
    setParams(
      { view: next, week: String(weekNum), year: String(year) },
      { replace: true },
    );

  const [statusFilter, setStatusFilter] = useState<Set<Status>>(
    () => new Set(ALL_STATUSES),
  );

  const shipments = useRepoSnapshot(useShipmentRepo());
  const drivers = useRepoSnapshot(useDriverRepo());
  const tks = useRepoSnapshot(useTKRepo());
  const suppliers = useRepoSnapshot(useSupplierRepo());

  const driverMap = useMemo(
    () => new Map<string, Driver>(drivers.map((d) => [d.id, d])),
    [drivers],
  );
  const tkMap = useMemo(
    () => new Map<string, TransportCompany>(tks.map((t) => [t.id, t])),
    [tks],
  );
  const supplierMap = useMemo(
    () => new Map<string, Supplier>(suppliers.map((s) => [s.id, s])),
    [suppliers],
  );

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ViewModeToggle value={view} onChange={setView} />
        <div style={{ flex: 1 }} />
        {canCreateShipment(role) && (
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Создание отгрузки — Form E (M9)"
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: 14,
              fontWeight: 700,
              padding: '4px 12px',
              cursor: 'not-allowed',
              opacity: 0.4,
            }}
          >
            + Новая отгрузка
          </button>
        )}
      </div>

      {view === 'table' ? (
        <>
          <TableFilters value={statusFilter} onChange={setStatusFilter} />
          <TableView
            shipments={shipments}
            statusFilter={statusFilter}
            selectedWeekNum={weekNum}
            selectedYear={year}
            driverMap={driverMap}
            tkMap={tkMap}
            supplierMap={supplierMap}
            role={role}
          />
        </>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <Box style={{ padding: 24 }}>
            <Label size={16} color="var(--ink-muted)">
              {PLACEHOLDER_LABEL[view]}
            </Label>
          </Box>
        </div>
      )}
    </div>
  );
};
