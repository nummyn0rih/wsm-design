import { useState, type CSSProperties, type FC } from 'react';
import type { Role, Shipment, Supplier } from '@/types/domain';
import {
  canDeleteShipment,
  canEditShipmentComment,
  canEditShipmentCoreFields,
} from '@/services/permissions';
import { useShipmentRepo } from '@/repos/RepoContext';
import { StatusChip } from '@/components/atoms/StatusChip';
import { Pill } from '@/components/atoms/Pill';
import { Label } from '@/components/atoms/Label';
import { Modal } from '@/components/atoms/Modal';
import { fmtDayMon, fmtKg } from '@/lib/format';
import { MarkArrivedButton } from './MarkArrivedButton';
import { ItemLine } from './ItemLine';

// Shared column layout — the TableView header strip uses the same template.
export const SHIPMENT_GRID: CSSProperties['gridTemplateColumns'] =
  '64px 64px minmax(120px,1.4fr) minmax(90px,1fr) 168px 56px 86px 86px minmax(110px,1.2fr) 30px 30px';

export const SHIPMENT_COLUMNS = [
  'Отгрузка',
  'Поступление',
  'Водитель',
  'ТК',
  'Статус',
  '№ акта',
  'Σ вес',
  'Позиций',
  'Комментарий',
  '',
  '',
];

const iconBtn: CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  padding: 0,
};

interface Props {
  shipment: Shipment;
  driverName: string;
  tkName: string;
  supplierMap: Map<string, Supplier>;
  role: Role;
  onEdit: (shipment: Shipment) => void;
}

export const ShipmentRow: FC<Props> = ({
  shipment: s,
  driverName,
  tkName,
  supplierMap,
  role,
  onEdit,
}) => {
  const repo = useShipmentRepo();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const totalKg = s.items.reduce((sum, it) => sum + it.kg, 0);
  const canEdit =
    canEditShipmentCoreFields(role, s) || canEditShipmentComment(role, s);
  const canDelete = canDeleteShipment(role, s);

  const doDelete = async () => {
    setBusy(true);
    await repo.delete(s.id);
    setBusy(false);
    setConfirmDelete(false);
  };

  return (
    <div style={{ borderBottom: '1px solid var(--border-soft)', padding: '6px 8px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: SHIPMENT_GRID,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Label size={13} mono>
          {fmtDayMon(s.shipDate)}
        </Label>
        <Label size={13} mono>
          {fmtDayMon(s.arrDate)}
        </Label>
        {/* ФИО — plain text in M6; DriverModal click wired in M10. */}
        <Label size={14}>{driverName}</Label>
        <Label size={14} color="var(--ink-muted)">
          {tkName}
        </Label>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <StatusChip status={s.status} />
          <MarkArrivedButton shipment={s} role={role} />
        </span>
        <Label size={13} color="var(--ink-muted)">
          —
        </Label>
        <Label size={13} mono>
          {fmtKg(totalKg)} кг
        </Label>
        <Pill bg="#e8e5df">{s.items.length} поз.</Pill>
        <span>
          {s.comment ? (
            <Label size={13} color="#a06000" style={{ fontStyle: 'italic' }}>
              {s.comment}
            </Label>
          ) : null}
        </span>
        {canEdit ? (
          <button
            type="button"
            style={iconBtn}
            onClick={() => onEdit(s)}
            aria-label="Редактировать отгрузку"
            title="Редактировать отгрузку"
          >
            ✏
          </button>
        ) : (
          <span />
        )}
        {canDelete ? (
          <button
            type="button"
            style={iconBtn}
            onClick={() => setConfirmDelete(true)}
            aria-label="Удалить отгрузку"
            title="Удалить отгрузку"
          >
            🗑
          </button>
        ) : (
          <span />
        )}
      </div>
      <div style={{ paddingLeft: 8, marginTop: 4 }}>
        {s.items.map((it) => (
          <ItemLine
            key={it.id}
            item={it}
            supplierName={supplierMap.get(it.supplierId)?.name ?? '—'}
          />
        ))}
      </div>

      {confirmDelete && (
        <Modal
          open
          onClose={() => setConfirmDelete(false)}
          title="Удалить отгрузку"
          width={360}
        >
          <Label size={15}>Удалить эту отгрузку? Действие необратимо.</Label>
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}
          >
            <button type="button" onClick={() => setConfirmDelete(false)} disabled={busy}>
              Отмена
            </button>
            <button
              type="button"
              onClick={doDelete}
              disabled={busy}
              style={{ color: '#a02020' }}
            >
              🗑 Удалить
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
