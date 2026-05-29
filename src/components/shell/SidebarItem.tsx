import type { CSSProperties, FC } from 'react';
import { NavLink } from 'react-router-dom';

interface Props {
  icon?: string;
  label: string;
  path: string;
  collapsed: boolean;
  isChild?: boolean;
}

function rowStyle(collapsed: boolean, isChild: boolean, active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: isChild ? '3px 10px 3px 0' : '6px 10px',
    paddingLeft: collapsed ? 0 : isChild ? 28 : 10,
    justifyContent: collapsed ? 'center' : 'flex-start',
    background: active ? 'var(--sidebar-active-bg)' : 'transparent',
    color: active ? '#fff' : 'var(--sidebar-fg)',
    borderLeft: `3px solid ${active ? 'var(--sidebar-active-bar)' : 'transparent'}`,
    cursor: 'pointer',
    fontFamily: 'var(--font-handwriting)',
    fontSize: isChild ? 12 : 14,
    fontWeight: isChild ? 400 : 700,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
}

export const SidebarItem: FC<Props> = ({ icon, label, path, collapsed, isChild = false }) => (
  <NavLink
    to={path}
    title={collapsed ? label : undefined}
    style={({ isActive }) => rowStyle(collapsed, isChild, isActive)}
  >
    {icon && (
      <span style={{ fontSize: 16, width: 18, textAlign: 'center' }} aria-hidden="true">
        {icon}
      </span>
    )}
    {!collapsed && <span>{isChild ? `· ${label}` : label}</span>}
  </NavLink>
);
