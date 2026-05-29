import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  bg?: string;
  border?: string;
  color?: string;
  size?: number;
}

export const Pill: FC<Props> = ({
  children,
  bg = '#eee',
  border,
  color = '#2a2a2a',
  size = 12,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '1px 8px',
      borderRadius: 999,
      background: bg,
      border: border ? `1px solid ${border}` : undefined,
      color,
      fontFamily: 'var(--font-handwriting)',
      fontSize: size,
      lineHeight: 1.3,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);
