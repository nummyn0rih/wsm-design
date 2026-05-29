import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FC,
} from 'react';
import type { Driver } from '@/types/domain';
import { formatPhoneRu, normalizePhoneRu } from '@/lib/phone';
import { canCrudDrivers } from '@/services/permissions';
import { useRole } from '@/context/RoleContext';
import {
  useDriverRepo,
  useShipmentRepo,
  useTKRepo,
} from '@/repos/RepoContext';
import { useRepoSnapshot } from '@/repos/useRepoSnapshot';
import { Label } from '@/components/atoms/Label';
import { Modal } from '@/components/atoms/Modal';
import { Toast } from '@/components/atoms/Toast';
import { DriverModal } from '@/components/shipments/DriverModal/DriverModal';
import { DriverEditModal, type DriverEditMode } from './DriverEditModal';

const GRID = 'minmax(160px,1.4fr) 150px minmax(120px,1fr) minmax(140px,1.4fr) 72px';

const headCell: CSSProperties = {
  textTransform: 'uppercase',
};

function matchDriver(d: Driver, search: string): boolean {
  const q = search.trim();
  if (!q) return true;
  if (d.fio.toLowerCase().includes(q.toLowerCase())) return true;
  const digits = q.replace(/\D/g, '');
  if (digits && d.phone.replace(/\D/g, '').includes(digits)) return true;
  const norm = normalizePhoneRu(q);
  if (norm && d.phone === norm) return true;
  return false;
}

function truncate(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export const DriversRef: FC = () => {
  const { role } = useRole();
  const isAdmin = canCrudDrivers(role);
  const driverRepo = useDriverRepo();
  const drivers = useRepoSnapshot(driverRepo);
  const tks = useRepoSnapshot(useTKRepo());
  const shipments = useRepoSnapshot(useShipmentRepo());

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTks, setSelectedTks] = useState<Set<string>>(() => new Set());
  const [tkOpen, setTkOpen] = useState(false);

  const [modalDriverId, setModalDriverId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<DriverEditMode | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Driver | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Search debounce 200ms.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  const tkName = (id: string) => tks.find((t) => t.id === id)?.name ?? '—';
  const shipmentCount = (driverId: string) =>
    shipments.filter((s) => s.driverId === driverId).length;

  const rows = useMemo(() => {
    return drivers
      .filter((d) => matchDriver(d, search))
      .filter((d) => selectedTks.size === 0 || selectedTks.has(d.tkId))
      .slice()
      .sort((a, b) => a.fio.localeCompare(b.fio, 'ru'));
  }, [drivers, search, selectedTks]);

  const toggleTk = (id: string) =>
    setSelectedTks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const doDelete = async () => {
    if (!confirmDelete) return;
    // Handler-level guard (not UI-only): admin + no dependent shipments.
    if (!isAdmin || shipmentCount(confirmDelete.id) > 0) {
      setConfirmDelete(null);
      return;
    }
    setBusy(true);
    await driverRepo.delete(confirmDelete.id);
    setBusy(false);
    setConfirmDelete(null);
    setToast('Водитель удалён');
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Label size={18} bold>
          Водители
        </Label>
        <div style={{ flex: 1 }} />
        <input
          type="search"
          value={searchInput}
          placeholder="Поиск по ФИО или телефону"
          aria-label="Поиск водителей"
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            fontFamily: 'var(--font-handwriting)',
            fontSize: 14,
            padding: '4px 8px',
            border: '1.5px solid var(--border)',
            borderRadius: 3,
            background: '#fff',
            minWidth: 220,
          }}
        />
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-expanded={tkOpen}
            onClick={() => setTkOpen((o) => !o)}
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: 14,
              padding: '4px 10px',
              border: '1.5px solid var(--border)',
              borderRadius: 3,
              background: tkOpen ? 'var(--border-soft)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            ТК: {selectedTks.size === 0 ? 'все' : selectedTks.size}
          </button>
          {tkOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                background: 'var(--bg)',
                border: '2px solid var(--border)',
                boxShadow: '3px 4px 0 rgba(0,0,0,0.2)',
                padding: 8,
                zIndex: 50,
                minWidth: 180,
                maxHeight: 260,
                overflowY: 'auto',
              }}
              className="wsm-scroll"
            >
              {tks.map((t) => (
                <label
                  key={t.id}
                  style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '2px 0' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTks.has(t.id)}
                    onChange={() => toggleTk(t.id)}
                  />
                  <Label size={13}>{t.name}</Label>
                </label>
              ))}
              {selectedTks.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTks(new Set())}
                  style={{
                    marginTop: 6,
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Сбросить
                </button>
              )}
            </div>
          )}
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setEditMode({ kind: 'create' })}
            style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: 14,
              fontWeight: 700,
              padding: '4px 12px',
              cursor: 'pointer',
            }}
          >
            + Новый водитель
          </button>
        )}
      </div>

      <div className="wsm-scroll" style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID,
            gap: 8,
            padding: '4px 8px',
          }}
        >
          {['ФИО', 'Телефон', 'ТК', 'Доп. инфо', ''].map((c, i) => (
            <Label key={i} size={11} color="var(--ink-muted)" style={headCell}>
              {c}
            </Label>
          ))}
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Label size={15} color="var(--ink-muted)">
              Водители не найдены
            </Label>
          </div>
        ) : (
          rows.map((d) => {
            const cnt = shipmentCount(d.id);
            const delDisabled = cnt > 0;
            return (
              <div
                key={d.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  gap: 8,
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderBottom: '1px solid var(--border-soft)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalDriverId(d.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-handwriting)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--link, #1a4868)',
                    textDecoration: 'underline',
                  }}
                >
                  {d.fio}
                </button>
                <Label size={13} mono>
                  {formatPhoneRu(d.phone)}
                </Label>
                <Label size={14} color="var(--ink-muted)">
                  {tkName(d.tkId)}
                </Label>
                <Label size={13} color="var(--ink-muted)">
                  {d.info ? truncate(d.info) : '—'}
                </Label>
                <span style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        aria-label="Редактировать водителя"
                        title="Редактировать водителя"
                        onClick={() => setEditMode({ kind: 'edit', driverId: d.id })}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 13,
                        }}
                      >
                        ✏
                      </button>
                      <button
                        type="button"
                        aria-label="Удалить водителя"
                        title={
                          delDisabled
                            ? `Используется в ${cnt} отгрузках`
                            : 'Удалить водителя'
                        }
                        disabled={delDisabled}
                        aria-disabled={delDisabled || undefined}
                        onClick={() => !delDisabled && setConfirmDelete(d)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: delDisabled ? 'not-allowed' : 'pointer',
                          fontSize: 13,
                          opacity: delDisabled ? 0.3 : 1,
                        }}
                      >
                        🗑
                      </button>
                    </>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      {modalDriverId && (
        <DriverModal driverId={modalDriverId} onClose={() => setModalDriverId(null)} />
      )}

      {editMode && (
        <DriverEditModal
          mode={editMode}
          onClose={() => setEditMode(null)}
          onSaved={(msg) => {
            setEditMode(null);
            setToast(msg);
          }}
        />
      )}

      {confirmDelete && (
        <Modal
          open
          onClose={() => setConfirmDelete(null)}
          title="Удалить водителя"
          width={360}
        >
          <Label size={15}>
            Удалить водителя «{confirmDelete.fio}»? Действие необратимо.
          </Label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button type="button" onClick={() => setConfirmDelete(null)} disabled={busy}>
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

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
};
