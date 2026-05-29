import { useState, type FC } from 'react';
import type { Role, Shipment } from '@/types/domain';
import {
  canTransitionShipmentStatus,
  transitionShipment,
} from '@/services/shipmentStatus';
import { useShipmentRepo } from '@/repos/RepoContext';
import { Modal } from '@/components/atoms/Modal';
import { Label } from '@/components/atoms/Label';

interface Props {
  shipment: Shipment;
  role: Role;
}

// sent → arrived from TableView. Admin always; Operator only via this action
// (context 'tableView'). Never rendered for other statuses.
export const MarkArrivedButton: FC<Props> = ({ shipment, role }) => {
  const repo = useShipmentRepo();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (shipment.status !== 'sent') return null;
  if (!canTransitionShipmentStatus(role, 'sent', 'arrived', 'tableView')) {
    return null;
  }

  const confirm = async () => {
    const result = transitionShipment(shipment, 'arrived', role, 'tableView');
    if (!result.ok) {
      setOpen(false);
      return;
    }
    setBusy(true);
    await repo.save(result.shipment);
    setBusy(false);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Отметить прибывшим"
        title="Отметить прибывшим"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          color: '#1a6b3a',
          padding: '0 2px',
        }}
      >
        ✓
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Отметить прибывшим" width={360}>
        <Label size={15}>Отметить отгрузку прибывшей?</Label>
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}
        >
          <button type="button" onClick={() => setOpen(false)} disabled={busy}>
            Отмена
          </button>
          <button type="button" onClick={confirm} disabled={busy}>
            ✓ Подтвердить
          </button>
        </div>
      </Modal>
    </>
  );
};
