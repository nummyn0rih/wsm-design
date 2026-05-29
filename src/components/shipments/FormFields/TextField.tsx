import type { CSSProperties, FC } from 'react';
import { Label } from '@/components/atoms/Label';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  maxLength?: number;
  rows?: number;
  error?: string;
}

const areaStyle: CSSProperties = {
  fontFamily: 'var(--font-handwriting)',
  fontSize: 14,
  padding: '4px 8px',
  border: '1.5px solid var(--border)',
  borderRadius: 3,
  background: '#fff',
  color: 'var(--ink)',
  width: '100%',
  boxSizing: 'border-box',
  resize: 'vertical',
};

// Multiline text (comment). Single-line variants not needed in Phase 1 Form E.
export const TextField: FC<Props> = ({
  label,
  value,
  onChange,
  readOnly = false,
  maxLength,
  rows = 2,
  error,
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Label size={12} color="var(--ink-muted)">
      {label}
    </Label>
    <textarea
      value={value}
      rows={rows}
      maxLength={maxLength}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...areaStyle,
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
