import type { CSSProperties, FC } from 'react';
import { Label } from '@/components/atoms/Label';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  ariaLabel?: string;
}

const selectStyle: CSSProperties = {
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

export const SelectField: FC<Props> = ({
  label,
  value,
  options,
  onChange,
  placeholder = '—',
  required = false,
  disabled = false,
  error,
  ariaLabel,
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    {label && (
      <Label size={12} color="var(--ink-muted)">
        {label}
        {required && <span style={{ color: '#a02020' }}> *</span>}
      </Label>
    )}
    <select
      value={value}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...selectStyle,
        ...(disabled ? { background: '#f0ede8', cursor: 'default' } : null),
        ...(error ? { borderColor: '#a02020' } : null),
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {error && (
      <Label size={11} color="#a02020">
        {error}
      </Label>
    )}
  </label>
);
