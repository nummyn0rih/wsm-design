import type { CSSProperties, FC } from 'react';
import { Label } from '@/components/atoms/Label';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  min?: number;
  step?: number;
  error?: string;
  ariaLabel?: string;
}

const inputStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 14,
  padding: '4px 8px',
  border: '1.5px solid var(--border)',
  borderRadius: 3,
  background: '#fff',
  color: 'var(--ink)',
  width: '100%',
  boxSizing: 'border-box',
  textAlign: 'right',
};

export const NumberField: FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
  min = 0,
  step = 1,
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
    <input
      type="number"
      inputMode="numeric"
      value={value}
      min={min}
      step={step}
      placeholder={placeholder}
      readOnly={readOnly}
      aria-label={ariaLabel ?? label}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...inputStyle,
        ...(readOnly ? { background: '#f0ede8', cursor: 'default' } : null),
        ...(error ? { borderColor: '#a02020' } : null),
      }}
    />
    {error && (
      <Label size={11} color="#a02020">
        {error}
      </Label>
    )}
  </label>
);
