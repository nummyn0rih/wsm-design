import type { CSSProperties, FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  size?: number;
  bold?: boolean;
  color?: string;
  mono?: boolean;
  style?: CSSProperties;
}

export const Label: FC<Props> = ({
  children,
  size = 14,
  bold = false,
  color,
  mono = false,
  style,
}) => {
  const merged: CSSProperties = {
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-handwriting)',
    fontSize: size,
    fontWeight: bold ? 700 : 400,
    color,
    lineHeight: 1.2,
    ...style,
  };
  return <span style={merged}>{children}</span>;
};
