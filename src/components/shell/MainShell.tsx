import { useState, type FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Pill } from '@/components/atoms/Pill';
import { Label } from '@/components/atoms/Label';
import { Sidebar } from './Sidebar';
import { RoleToggle } from './RoleToggle';

export const MainShell: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 12px',
          background: 'var(--topbar-bg)',
          color: '#fff',
          borderBottom: '2px solid #000',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            padding: '0 4px',
          }}
        >
          ☰
        </button>
        <Label size={15} bold color="#fff">
          Учёт отгрузок · WSM
        </Label>
        <Pill bg="#3a3a3a" color="#aed6be" size={11}>
          demo
        </Pill>
        <div style={{ flex: 1 }} />
        <Label size={11} color="#888" style={{ fontStyle: 'italic' }}>
          демо-переключатель роли:
        </Label>
        <RoleToggle />
      </header>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar collapsed={collapsed} />
        <main className="wsm-scroll" style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
