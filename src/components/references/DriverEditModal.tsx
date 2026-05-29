import { useMemo, useState, type CSSProperties, type FC } from 'react';
import type { Driver } from '@/types/domain';
import { newId } from '@/lib/ids';
import { validateDriver } from '@/lib/validation';
import { canCrudDrivers } from '@/services/permissions';
import { useRole } from '@/context/RoleContext';
import { useDriverRepo, useTKRepo } from '@/repos/RepoContext';
import { useRepoSnapshot } from '@/repos/useRepoSnapshot';
import { Modal } from '@/components/atoms/Modal';
import { Label } from '@/components/atoms/Label';
import { PhoneField } from '@/components/atoms/PhoneField';

export type DriverEditMode =
  | { kind: 'create' }
  | { kind: 'edit'; driverId: string };

interface Props {
  mode: DriverEditMode;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const inputStyle: CSSProperties = {
  fontFamily: 'var(--font-handwriting)',
  fontSize: 14,
  padding: '4px 8px',
  border: '1.5px solid var(--border)',
  borderRadius: 3,
  background: '#fff',
  color: 'var(--ink)',
  width: '100%',
  boxSizing: 'border-box',
};

export const DriverEditModal: FC<Props> = ({ mode, onClose, onSaved }) => {
  const { role } = useRole();
  const repo = useDriverRepo();
  const tks = useRepoSnapshot(useTKRepo());
  const drivers = useRepoSnapshot(repo);

  const existing =
    mode.kind === 'edit' ? drivers.find((d) => d.id === mode.driverId) ?? null : null;

  const [fio, setFio] = useState(existing?.fio ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [tkId, setTkId] = useState(existing?.tkId ?? '');
  const [info, setInfo] = useState(existing?.info ?? '');
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const draft: Driver = {
    id: existing?.id ?? '',
    fio,
    phone,
    tkId,
    info,
  };
  const errorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const e of validateDriver(draft)) {
      if (!(e.field in map)) map[e.field] = e.message;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fio, phone, tkId, info]);
  const valid = Object.keys(errorMap).length === 0;
  const err = (field: string) => (attempted ? errorMap[field] : undefined);

  // Admin-only guard at handler level (UI also hides entry points for others).
  if (!canCrudDrivers(role)) return null;

  const submit = async () => {
    setAttempted(true);
    if (!valid) return;
    setBusy(true);
    const driver: Driver = {
      id: existing?.id ?? newId('drv'),
      fio: fio.trim(),
      phone,
      tkId,
      info,
    };
    await repo.save(driver);
    setBusy(false);
    onSaved(mode.kind === 'create' ? 'Водитель добавлен' : 'Водитель сохранён');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={mode.kind === 'create' ? 'Новый водитель' : 'Редактирование водителя'}
      width={460}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Label size={12} color="var(--ink-muted)">
            ФИО<span style={{ color: '#a02020' }}> *</span>
          </Label>
          <input
            type="text"
            value={fio}
            onChange={(e) => setFio(e.target.value)}
            style={{
              ...inputStyle,
              ...(err('fio') ? { borderColor: '#a02020' } : null),
            }}
          />
          {err('fio') && (
            <Label size={11} color="#a02020">
              {errorMap['fio']}
            </Label>
          )}
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Label size={12} color="var(--ink-muted)">
            Телефон<span style={{ color: '#a02020' }}> *</span>
          </Label>
          <PhoneField value={phone} onChange={setPhone} error={err('phone')} />
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Label size={12} color="var(--ink-muted)">
            ТК<span style={{ color: '#a02020' }}> *</span>
          </Label>
          <select
            value={tkId}
            onChange={(e) => setTkId(e.target.value)}
            style={{
              ...inputStyle,
              ...(err('tkId') ? { borderColor: '#a02020' } : null),
            }}
          >
            <option value="">—</option>
            {tks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {err('tkId') && (
            <Label size={11} color="#a02020">
              {errorMap['tkId']}
            </Label>
          )}
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Label size={12} color="var(--ink-muted)">
            Доп. инфо
          </Label>
          <textarea
            value={info}
            rows={2}
            maxLength={500}
            onChange={(e) => setInfo(e.target.value)}
            style={{
              ...inputStyle,
              resize: 'vertical',
              ...(err('info') ? { borderColor: '#a02020' } : null),
            }}
          />
          {err('info') && (
            <Label size={11} color="#a02020">
              {errorMap['info']}
            </Label>
          )}
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button type="button" onClick={submit} disabled={busy || !valid}>
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
};
