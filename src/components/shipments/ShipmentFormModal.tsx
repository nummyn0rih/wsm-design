import { useMemo, useState, type FC } from 'react';
import type {
  Driver,
  RawMaterial,
  Role,
  Shipment,
  ShipmentItem,
  Status,
  Supplier,
  TaraEntry,
  TransportCompany,
} from '@/types/domain';
import { formatLocalDate, parseLocalDate } from '@/lib/date';
import { fmtKg } from '@/lib/format';
import { newId } from '@/lib/ids';
import { validateShipment } from '@/lib/validation';
import {
  canDeleteShipment,
  canEditShipmentComment,
  canEditShipmentCoreFields,
  canEditShipmentItems,
} from '@/services/permissions';
import { canTransitionShipmentStatus } from '@/services/shipmentStatus';
import { useShipmentRepo } from '@/repos/RepoContext';
import { Modal } from '@/components/atoms/Modal';
import { Label } from '@/components/atoms/Label';
import { DateField } from './FormFields/DateField';
import { SelectField, type SelectOption } from './FormFields/SelectField';
import { NumberField } from './FormFields/NumberField';
import { TextField } from './FormFields/TextField';

export type FormMode =
  | { kind: 'create' }
  | { kind: 'createFromPlan'; rawId: string; arrDate: string }
  | { kind: 'edit'; shipment: Shipment };

interface Props {
  mode: FormMode;
  role: Role;
  drivers: Driver[];
  tks: TransportCompany[];
  suppliers: Supplier[];
  raws: RawMaterial[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface ItemDraft {
  id: string;
  rawId: string;
  kg: string; // raw input; parsed to number on build
  supplierId: string;
  tara: TaraEntry[];
}

function addDay(iso: string): string {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
}

function blankItem(rawId = ''): ItemDraft {
  return { id: newId('itm'), rawId, kg: '', supplierId: '', tara: [] };
}

function initItems(mode: FormMode): ItemDraft[] {
  if (mode.kind === 'edit') {
    return mode.shipment.items.map((it) => ({
      id: it.id,
      rawId: it.rawId,
      kg: String(it.kg),
      supplierId: it.supplierId,
      tara: it.tara,
    }));
  }
  if (mode.kind === 'createFromPlan') return [blankItem(mode.rawId)];
  return [blankItem()];
}

export const ShipmentFormModal: FC<Props> = ({
  mode,
  role,
  drivers,
  tks,
  suppliers,
  raws,
  onClose,
  onSaved,
}) => {
  const repo = useShipmentRepo();
  const base = mode.kind === 'edit' ? mode.shipment : null;

  const [shipDate, setShipDate] = useState(base?.shipDate ?? '');
  const [arrDate, setArrDate] = useState(
    base?.arrDate ?? (mode.kind === 'createFromPlan' ? mode.arrDate : ''),
  );
  const [driverId, setDriverId] = useState(base?.driverId ?? '');
  const [comment, setComment] = useState(base?.comment ?? '');
  const [items, setItems] = useState<ItemDraft[]>(() => initItems(mode));
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const arrLocked = mode.kind === 'createFromPlan';
  const rawLocked = mode.kind === 'createFromPlan';

  // Capabilities — create modes are always full; edit modes derive from role+status.
  const isCreate = mode.kind !== 'edit';
  const coreEditable = isCreate || canEditShipmentCoreFields(role, base!);
  const itemsEditable = isCreate || canEditShipmentItems(role, base!);
  const commentEditable = isCreate || canEditShipmentComment(role, base!);
  const anyEditable = coreEditable || itemsEditable || commentEditable;

  // tk auto-fills from driver (live), readonly.
  const tkId = useMemo(
    () => drivers.find((d) => d.id === driverId)?.tkId ?? '',
    [drivers, driverId],
  );
  const tkName = tks.find((t) => t.id === tkId)?.name ?? '';

  const driverOptions: SelectOption[] = useMemo(
    () => drivers.map((d) => ({ value: d.id, label: d.fio })),
    [drivers],
  );
  const rawOptions: SelectOption[] = useMemo(
    () =>
      [...raws]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((r) => ({ value: r.id, label: r.name })),
    [raws],
  );
  const supplierOptions: SelectOption[] = useMemo(
    () => suppliers.map((s) => ({ value: s.id, label: s.name })),
    [suppliers],
  );

  const buildShipment = (status: Status): Shipment => {
    const builtItems: ShipmentItem[] = items.map((it) => ({
      id: it.id,
      rawId: it.rawId,
      kg: Number(it.kg),
      supplierId: it.supplierId,
      tara: it.tara,
    }));
    const now = new Date().toISOString();
    if (base) {
      // Guard at the handler level: non-editable parts always come from the
      // original record, never from form state (defends against UI bypass).
      return {
        ...base,
        shipDate: coreEditable ? shipDate : base.shipDate,
        arrDate: coreEditable ? arrDate : base.arrDate,
        driverId: coreEditable ? driverId : base.driverId,
        tkId: coreEditable ? tkId : base.tkId,
        status,
        comment: commentEditable ? comment : base.comment,
        items: itemsEditable ? builtItems : base.items,
        updatedAt: now,
      };
    }
    return {
      id: newId('shp'),
      shipDate,
      arrDate,
      driverId,
      tkId,
      status,
      comment,
      items: builtItems,
      createdAt: now,
      updatedAt: now,
    };
  };

  // Status is irrelevant to validation, so a neutral preview drives live errors.
  const previewStatus: Status = base ? base.status : 'scheduled';
  const errorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const e of validateShipment(buildShipment(previewStatus))) {
      if (!(e.field in map)) map[e.field] = e.message;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipDate, arrDate, driverId, tkId, comment, items]);

  const valid = Object.keys(errorMap).length === 0;
  // Inline errors surface only after a save attempt (avoids noisy empty-form red).
  const err = (field: string) => (attempted ? errorMap[field] : undefined);

  const submit = async (status: Status) => {
    setAttempted(true);
    if (!valid) return;
    if (base && status !== base.status) {
      if (!canTransitionShipmentStatus(role, base.status, status, 'formE')) return;
    }
    setBusy(true);
    await repo.save(buildShipment(status));
    setBusy(false);
    onSaved('Отгрузка сохранена');
  };

  const doDelete = async () => {
    if (!base || !canDeleteShipment(role, base)) return;
    setBusy(true);
    await repo.delete(base.id);
    setBusy(false);
    onSaved('Отгрузка удалена');
  };

  const onShipDateChange = (value: string) => {
    setShipDate(value);
    // Autofill arrDate = +1 day unless it is locked (plan-mode) or already set.
    if (!arrLocked && value && !arrDate) setArrDate(addDay(value));
  };

  const updateItem = (id: string, patch: Partial<ItemDraft>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, blankItem()]);
  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const sumKg = items.reduce((s, it) => s + (Number(it.kg) || 0), 0);
  const supplierCount = new Set(
    items.map((it) => it.supplierId).filter((v) => v !== ''),
  ).size;

  const title =
    mode.kind === 'edit'
      ? coreEditable
        ? 'Редактирование отгрузки'
        : 'Отгрузка (просмотр)'
      : 'Новая отгрузка';

  // Footer actions.
  const canSend =
    !!base && base.status === 'scheduled' && coreEditable;
  const canArrive = !!base && base.status === 'sent' && coreEditable;
  const showDelete = !!base && canDeleteShipment(role, base);

  return (
    <Modal open onClose={onClose} title={title} width={640}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Header fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <DateField
            label="Дата отгрузки"
            value={shipDate}
            onChange={onShipDateChange}
            required
            readOnly={!coreEditable}
            error={err('shipDate')}
          />
          <DateField
            label="Дата поступления"
            value={arrDate}
            onChange={setArrDate}
            required
            readOnly={!coreEditable || arrLocked}
            min={shipDate || undefined}
            error={err('arrDate')}
          />
          <SelectField
            label="Водитель"
            value={driverId}
            options={driverOptions}
            onChange={setDriverId}
            required
            disabled={!coreEditable}
            error={err('driverId')}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Label size={12} color="var(--ink-muted)">
              ТК
            </Label>
            <div
              style={{
                fontFamily: 'var(--font-handwriting)',
                fontSize: 14,
                padding: '5px 8px',
                border: '1.5px solid var(--border)',
                borderRadius: 3,
                background: '#f0ede8',
                minHeight: 19,
              }}
            >
              {tkName || '—'}
            </div>
          </div>
        </div>

        <TextField
          label="Комментарий"
          value={comment}
          onChange={setComment}
          readOnly={!commentEditable}
          maxLength={200}
          error={err('comment')}
        />

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label size={13} bold>
            Позиции
          </Label>
          {err('items') && (
            <Label size={11} color="#a02020">
              {errorMap['items']}
            </Label>
          )}
          <div
            className="wsm-scroll"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 260,
              overflowY: 'auto',
            }}
          >
            {items.map((it, idx) => (
              <div
                key={it.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '20px 1.4fr 90px 1.4fr 28px',
                  gap: 6,
                  alignItems: 'start',
                }}
              >
                <Label size={13} mono style={{ paddingTop: 6 }}>
                  {idx + 1}
                </Label>
                <SelectField
                  value={it.rawId}
                  options={rawOptions}
                  onChange={(v) => updateItem(it.id, { rawId: v })}
                  placeholder="Сырьё"
                  ariaLabel={`Сырьё, позиция ${idx + 1}`}
                  disabled={!itemsEditable || (rawLocked && idx === 0)}
                  error={err(`items[${idx}].rawId`)}
                />
                <NumberField
                  value={it.kg}
                  onChange={(v) => updateItem(it.id, { kg: v })}
                  placeholder="кг"
                  ariaLabel={`Вес кг, позиция ${idx + 1}`}
                  readOnly={!itemsEditable}
                  min={1}
                  error={err(`items[${idx}].kg`)}
                />
                <SelectField
                  value={it.supplierId}
                  options={supplierOptions}
                  onChange={(v) => updateItem(it.id, { supplierId: v })}
                  placeholder="Поставщик"
                  ariaLabel={`Поставщик, позиция ${idx + 1}`}
                  disabled={!itemsEditable}
                  error={err(`items[${idx}].supplierId`)}
                />
                <button
                  type="button"
                  aria-label={`Удалить позицию ${idx + 1}`}
                  title="Удалить позицию"
                  disabled={!itemsEditable || items.length === 1}
                  onClick={() => removeItem(it.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor:
                      !itemsEditable || items.length === 1
                        ? 'not-allowed'
                        : 'pointer',
                    fontSize: 14,
                    opacity: !itemsEditable || items.length === 1 ? 0.3 : 1,
                    marginTop: 4,
                  }}
                >
                  ✕
                </button>
                {/* Tara — not editable in Phase 1; row note. */}
                <span />
                <Label size={11} color="var(--ink-muted)" style={{ gridColumn: '2 / 5' }}>
                  Тара: —
                </Label>
              </div>
            ))}
          </div>
          {itemsEditable && (
            <button
              type="button"
              onClick={addItem}
              style={{
                alignSelf: 'flex-start',
                fontFamily: 'var(--font-handwriting)',
                fontSize: 13,
                padding: '3px 10px',
                border: '1.5px solid var(--border)',
                borderRadius: 3,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              + Добавить позицию
            </button>
          )}
        </div>

        {/* Summary */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            padding: '8px 10px',
            borderTop: '1.5px solid var(--border-soft)',
            flexWrap: 'wrap',
          }}
        >
          <Label size={14} mono bold>
            Σ {fmtKg(sumKg)} кг
          </Label>
          <Label size={14} color="var(--ink-muted)">
            {items.length} позиций
          </Label>
          <Label size={14} color="var(--ink-muted)">
            {supplierCount} поставщиков
          </Label>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <button type="button" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          {showDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              style={{ color: '#a02020' }}
            >
              🗑 Удалить
            </button>
          )}
          {mode.kind === 'edit' ? (
            <>
              {anyEditable && (
                <button
                  type="button"
                  onClick={() => submit(base!.status)}
                  disabled={busy || !valid}
                >
                  Сохранить
                </button>
              )}
              {canSend && (
                <button
                  type="button"
                  onClick={() => submit('sent')}
                  disabled={busy || !valid}
                >
                  Отправить
                </button>
              )}
              {canArrive && (
                <button
                  type="button"
                  onClick={() => submit('arrived')}
                  disabled={busy || !valid}
                >
                  Отметить прибывшим
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => submit('scheduled')}
                disabled={busy || !valid}
              >
                Сохранить как запланировано
              </button>
              <button
                type="button"
                onClick={() => submit('sent')}
                disabled={busy || !valid}
              >
                ✓ Сохранить и отправить
              </button>
            </>
          )}
        </div>
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
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
            >
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
    </Modal>
  );
};
