import type { CSSProperties, FC } from 'react';

interface Props {
  color?: string;
  style?: CSSProperties;
}

export const HR: FC<Props> = ({ color = 'var(--border-soft)', style }) => (
  <hr
    style={{
      border: 0,
      borderTop: `1px dashed ${color}`,
      margin: '8px 0',
      ...style,
    }}
  />
);
