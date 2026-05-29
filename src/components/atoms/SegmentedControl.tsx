import type { ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  title?: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        border: '2px solid #555',
        borderRadius: 3,
        background: '#2a2a2a',
        overflow: 'hidden',
      }}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (!opt.disabled) onChange(opt.value);
            }}
            disabled={opt.disabled}
            aria-disabled={opt.disabled ? true : undefined}
            aria-pressed={active}
            title={opt.title}
            style={{
              padding: '3px 12px',
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              background: active ? 'var(--sidebar-active-bg)' : 'transparent',
              border: 'none',
              borderRight:
                i < options.length - 1 ? '2px solid #555' : 'none',
              color: active ? '#fff' : '#ccc',
              fontFamily: 'var(--font-handwriting)',
              fontSize: 13,
              fontWeight: 700,
              opacity: opt.disabled ? 0.5 : 1,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
