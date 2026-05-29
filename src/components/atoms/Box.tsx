import type { CSSProperties, FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Box: FC<Props> = ({ children, className, style }) => {
  const cls = className ? `sk-box ${className}` : 'sk-box';
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
};
