import type { FC } from 'react';
import { STATUS_LABELS, type Status } from '@/types/domain';
import { STATUS_CHIP_STYLES, STATUS_EMOJI } from '@/lib/status-chip';

interface Props {
  status: Status;
}

export const StatusChip: FC<Props> = ({ status }) => {
  const s = STATUS_CHIP_STYLES[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '1px 8px',
        borderRadius: 4,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
        fontFamily: 'var(--font-handwriting)',
        fontSize: 12,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden="true">{STATUS_EMOJI[status]}</span>
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};
