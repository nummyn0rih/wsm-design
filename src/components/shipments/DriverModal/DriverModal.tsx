import { useState, type FC } from 'react';
import { formatPhoneRu } from '@/lib/phone';
import { canCrudDrivers } from '@/services/permissions';
import { useRole } from '@/context/RoleContext';
import { useDriverRepo, useTKRepo } from '@/repos/RepoContext';
import { useRepoSnapshot } from '@/repos/useRepoSnapshot';
import { Modal } from '@/components/atoms/Modal';
import { Label } from '@/components/atoms/Label';
import { DriverEditModal } from '@/components/references/DriverEditModal';

interface Props {
  driverId: string;
  onClose: () => void;
}

async function copyPhone(e164: string): Promise<void> {
  const text = formatPhoneRu(e164);
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    // Clipboard unavailable or denied — silent no-op (no dependency, no crash).
  }
}

const row = { display: 'flex', flexDirection: 'column', gap: 2 } as const;

export const DriverModal: FC<Props> = ({ driverId, onClose }) => {
  const { role } = useRole();
  const drivers = useRepoSnapshot(useDriverRepo());
  const tks = useRepoSnapshot(useTKRepo());
  const [editing, setEditing] = useState(false);

  const driver = drivers.find((d) => d.id === driverId) ?? null;
  const tkName = driver ? (tks.find((t) => t.id === driver.tkId)?.name ?? '—') : '—';
  const isAdmin = canCrudDrivers(role);

  // While the edit modal is stacked, Esc/backdrop should close only it and keep
  // the card open. Both Modal Escape handlers fire on Esc, but each just clears
  // `editing`, so the card survives.
  const handleClose = () => {
    if (editing) setEditing(false);
    else onClose();
  };

  return (
    <Modal open onClose={handleClose} title="Карточка водителя" width={420}>
      {driver ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={row}>
            <Label size={12} color="var(--ink-muted)">
              ФИО
            </Label>
            <Label size={16} bold>
              {driver.fio}
            </Label>
          </div>

          <div style={row}>
            <Label size={12} color="var(--ink-muted)">
              Телефон
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Label size={15} mono>
                {formatPhoneRu(driver.phone)}
              </Label>
              <button
                type="button"
                aria-label="Копировать телефон"
                title="Копировать телефон"
                onClick={() => void copyPhone(driver.phone)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                📋
              </button>
            </div>
          </div>

          <div style={row}>
            <Label size={12} color="var(--ink-muted)">
              ТК
            </Label>
            <Label size={15}>{tkName}</Label>
          </div>

          {driver.info && (
            <div style={row}>
              <Label size={12} color="var(--ink-muted)">
                Доп. инфо
              </Label>
              <Label size={14}>{driver.info}</Label>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 4,
            }}
          >
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Phase 2"
              style={{ cursor: 'not-allowed', opacity: 0.4 }}
            >
              Открыть карточку ТК
            </button>
            {isAdmin && (
              <button type="button" onClick={() => setEditing(true)}>
                ✏ Редактировать водителя
              </button>
            )}
          </div>
        </div>
      ) : (
        <Label size={15} color="var(--ink-muted)">
          Водитель не найден.
        </Label>
      )}

      {editing && isAdmin && driver && (
        <DriverEditModal
          mode={{ kind: 'edit', driverId: driver.id }}
          onClose={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      )}
    </Modal>
  );
};
