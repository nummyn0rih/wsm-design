import { useEffect, useState, type FC } from 'react';
import { formatPhoneRu, normalizePhoneRu } from '@/lib/phone';

interface Props {
  value: string;
  onChange: (e164: string) => void;
  error?: string;
  placeholder?: string;
  id?: string;
}

export const PhoneField: FC<Props> = ({ value, onChange, error, placeholder, id }) => {
  const [display, setDisplay] = useState<string>(() =>
    value ? (formatPhoneRu(value) ?? value) : '',
  );
  useEffect(() => {
    setDisplay(value ? (formatPhoneRu(value) ?? value) : '');
  }, [value]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        value={display}
        placeholder={placeholder ?? '+7 (___) ___-__-__'}
        onChange={(e) => {
          const next = e.target.value;
          setDisplay(next);
          const e164 = normalizePhoneRu(next);
          if (e164) onChange(e164);
          else onChange(next);
        }}
        onBlur={() => {
          const e164 = normalizePhoneRu(display);
          if (e164) setDisplay(formatPhoneRu(e164));
        }}
        aria-invalid={error ? true : undefined}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          padding: '4px 8px',
          border: `1px solid ${error ? '#c04040' : '#b8b4a8'}`,
          background: '#fff',
          color: '#2a2a2a',
        }}
      />
      {error && (
        <span style={{ color: '#c04040', fontSize: 11, fontFamily: 'var(--font-handwriting)' }}>
          {error}
        </span>
      )}
    </div>
  );
};
