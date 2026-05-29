import type { CSSProperties, FC } from 'react';
import { Label } from '@/components/atoms/Label';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  readOnly?: boolean;
  min?: string;
  error?: string;
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

// Native <input type="date">; in plan-mode arrDate is passed readOnly (value stays
// in submit, unlike disabled). Sunday-block handled by validation layer, not here.
export const DateField: FC<Props> = ({
  label,
  value,
  onChange,
  required = false,
  readOnly = false,
  min,
  error,
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Label size={12} color="var(--ink-muted)">
      {label}
      {required && <span style={{ color: '#a02020' }}> *</span>}
    </Label>
    <input
      type="date"
      value={value}
      min={min}
      readOnly={readOnly}
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
