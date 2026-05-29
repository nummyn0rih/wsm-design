import { useMemo, type FC } from 'react';
import type { RawMaterial, Shipment, WeekPlan } from '@/types/domain';
import { canDeleteVisibleRaw } from '@/services/planRules';
import { rawColor } from '@/lib/raw-colors';
import { Label } from '@/components/atoms/Label';

interface Props {
  wp: WeekPlan;
  raws: RawMaterial[];
  shipments: Shipment[];
  onToggle: (rawId: string, checked: boolean) => void;
  onClose: () => void;
}

// Admin-only manager for WeekPlan.visibleRaws. Checking a raw is always allowed;
// unchecking is blocked (inert checkbox + tooltip) when the raw is protected by
// invariant I10 (plan>0 or has shipments this week — via canDeleteVisibleRaw).
export const VegVisibilityPopover: FC<Props> = ({
  wp,
  raws,
  shipments,
  onToggle,
  onClose,
}) => {
  const ordered = useMemo(
    () => [...raws].sort((a, b) => a.sortOrder - b.sortOrder),
    [raws],
  );

  return (
    <>
      {/* click-away backdrop */}
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'default',
          zIndex: 10,
        }}
      />
      <div
        className="sk-box"
        role="dialog"
        aria-label="Видимые овощи недели"
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          zIndex: 11,
          width: 280,
          maxHeight: 360,
          overflowY: 'auto',
          padding: 10,
          background: '#fff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        }}
      >
        <Label size={13} bold>
          Овощи недели
        </Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
          {ordered.map((raw) => {
            const checked = wp.visibleRaws.includes(raw.id);
            const locked = checked && !canDeleteVisibleRaw(wp, raw.id, shipments);
            const { dot } = rawColor(raw.id, raws);
            return (
              <label
                key={raw.id}
                title={locked ? 'нельзя скрыть: есть план/отгрузки' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '3px 4px',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  opacity: locked ? 0.7 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={locked}
                  onChange={(e) => onToggle(raw.id, e.target.checked)}
                />
                <span
                  aria-hidden="true"
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: dot,
                    flexShrink: 0,
                  }}
                />
                <Label size={13}>{raw.name}</Label>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
};
