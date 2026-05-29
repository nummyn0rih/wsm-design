import { useMemo, useState, type FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Driver, Status, Supplier, TransportCompany } from '@/types/domain';
import { currentWeekId } from '@/lib/date';
import { useRole } from '@/context/RoleContext';
import { canCreateShipment } from '@/services/permissions';
import {
  useDriverRepo,
  usePlanRepo,
  useRawRepo,
  useShipmentRepo,
  useSupplierRepo,
  useTKRepo,
} from '@/repos/RepoContext';
import { useRepoSnapshot } from '@/repos/useRepoSnapshot';
import { Toast } from '@/components/atoms/Toast';
import { ViewModeToggle, type ViewMode } from './ViewModeToggle';
import { TableFilters } from './TableView/TableFilters';
import { TableView } from './TableView/TableView';
import { HeatmapView } from './HeatmapView/HeatmapView';
import { PlanView } from './PlanView/PlanView';
import { ShipmentFormModal, type FormMode } from './ShipmentFormModal';
import { DriverModal } from './DriverModal/DriverModal';

const ALL_STATUSES: Status[] = ['scheduled', 'sent', 'arrived'];

function parseView(v: string | null): ViewMode {
  return v === 'heatmap' || v === 'plan' ? v : 'table';
}

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

  const setWeekYear = (nextWeek: number, nextYear: number) =>
    setParams(
      { view, week: String(nextWeek), year: String(nextYear) },
      { replace: true },
    );

  const [statusFilter, setStatusFilter] = useState<Set<Status>>(
    () => new Set(ALL_STATUSES),
  );
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [driverModalId, setDriverModalId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const shipments = useRepoSnapshot(useShipmentRepo());
  const drivers = useRepoSnapshot(useDriverRepo());
  const tks = useRepoSnapshot(useTKRepo());
  const suppliers = useRepoSnapshot(useSupplierRepo());
  const raws = useRepoSnapshot(useRawRepo());
  const plans = useRepoSnapshot(usePlanRepo());

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
            onClick={() => setFormMode({ kind: 'create' })}
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: 14,
              fontWeight: 700,
              padding: '4px 12px',
              cursor: 'pointer',
            }}
          >
            + Новая отгрузка
          </button>
        )}
      </div>

      {view === 'table' && (
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
            onEdit={(s) => setFormMode({ kind: 'edit', shipment: s })}
            onDriverClick={(driverId) => setDriverModalId(driverId)}
          />
        </>
      )}

      {view === 'heatmap' && (
        <HeatmapView
          shipments={shipments}
          raws={raws}
          weekNum={weekNum}
          year={year}
          onWeekChange={setWeekYear}
        />
      )}

      {view === 'plan' && (
        <PlanView
          shipments={shipments}
          raws={raws}
          plans={plans}
          weekNum={weekNum}
          year={year}
          role={role}
          onWeekChange={setWeekYear}
          onCreateFromPlan={(rawId, arrDate) =>
            setFormMode({ kind: 'createFromPlan', rawId, arrDate })
          }
        />
      )}

      {formMode && (
        <ShipmentFormModal
          mode={formMode}
          role={role}
          drivers={drivers}
          tks={tks}
          suppliers={suppliers}
          raws={raws}
          onClose={() => setFormMode(null)}
          onSaved={(message) => {
            setFormMode(null);
            setToast(message);
          }}
        />
      )}

      {driverModalId && (
        <DriverModal
          driverId={driverModalId}
          onClose={() => setDriverModalId(null)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
};
