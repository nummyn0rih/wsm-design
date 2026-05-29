import { useMemo, useSyncExternalStore, type FC } from 'react';
import { useRawRepo } from '@/repos/RepoContext';
import { rawColor } from '@/lib/raw-colors';
import type { RawMaterial } from '@/types/domain';

interface Props {
  rawId: string;
}

const EMPTY: RawMaterial[] = [];

export const RawPill: FC<Props> = ({ rawId }) => {
  const repo = useRawRepo();
  const raws = useSyncExternalStore<RawMaterial[]>(
    repo.subscribe.bind(repo),
    () => repo.listSync() ?? EMPTY,
    () => EMPTY,
  );
  const { name, bg, dot } = useMemo(() => {
    const r = raws.find((x) => x.id === rawId);
    const color = rawColor(rawId, raws);
    return { name: r?.name ?? rawId, bg: color.bg, dot: color.dot };
  }, [raws, rawId]);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '1px 8px',
        borderRadius: 999,
        background: bg,
        fontFamily: 'var(--font-handwriting)',
        fontSize: 13,
        color: '#2a2a2a',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dot,
          display: 'inline-block',
        }}
      />
      {name}
    </span>
  );
};
