import type { FC } from 'react';
import { Box } from '@/components/atoms/Box';
import { Label } from '@/components/atoms/Label';

interface Props {
  title?: string;
  phase?: 2 | 3;
}

export const StubPage: FC<Props> = ({ title, phase }) => {
  const subtitle = phase ? `Раздел в работе (Phase ${phase})` : 'Раздел в работе';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        minHeight: '100%',
      }}
    >
      <Box style={{ maxWidth: 480, textAlign: 'center', padding: 24 }}>
        {title && (
          <div style={{ marginBottom: 8 }}>
            <Label size={22} bold>
              {title}
            </Label>
          </div>
        )}
        <Label size={16} color="var(--ink-muted)">
          {subtitle}
        </Label>
      </Box>
    </div>
  );
};
