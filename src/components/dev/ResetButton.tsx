import type { CSSProperties, FC } from 'react';

interface Props {
  collapsed: boolean;
}

const LS_PREFIX = 'wsm:v1:';

function resetToSeeds(): void {
  if (!window.confirm('Сбросить все данные к seed?')) return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(LS_PREFIX)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
  // Fresh boot() rebuilds repos from empty LS and re-seeds (flag is gone).
  location.reload();
}

const buttonStyle = (collapsed: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '6px 10px',
  paddingLeft: collapsed ? 0 : 10,
  justifyContent: collapsed ? 'center' : 'flex-start',
  background: 'transparent',
  color: 'var(--sidebar-fg)',
  border: 'none',
  borderTop: '2px solid #000',
  cursor: 'pointer',
  fontFamily: 'var(--font-handwriting)',
  fontSize: 13,
  fontWeight: 700,
  textAlign: 'left',
});

export const ResetButton: FC<Props> = ({ collapsed }) => {
  if (!import.meta.env.DEV) return null;

  return (
    <button
      type="button"
      onClick={resetToSeeds}
      title={collapsed ? 'reset to seeds' : undefined}
      aria-label="reset to seeds"
      style={buttonStyle(collapsed)}
    >
      <span style={{ fontSize: 16, width: 18, textAlign: 'center' }} aria-hidden="true">
        ⟲
      </span>
      {!collapsed && <span>reset to seeds</span>}
    </button>
  );
};
