import { useMemo, useState, type FC } from 'react';
import { useRole } from '@/context/RoleContext';
import { ResetButton } from '@/components/dev/ResetButton';
import { NAV, type NavChild, type NavItem } from './nav-config';
import { SidebarItem } from './SidebarItem';

interface Props {
  collapsed: boolean;
}

interface VisibleParent {
  item: NavItem;
  visibleChildren: NavChild[];
}

export const Sidebar: FC<Props> = ({ collapsed }) => {
  const { role } = useRole();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ refs: true });

  const visible = useMemo<VisibleParent[]>(() => {
    return NAV.flatMap<VisibleParent>((item) => {
      if (item.children) {
        const visibleChildren = item.children.filter((c) => c.visibleTo.includes(role));
        if (visibleChildren.length === 0) return [];
        return [{ item, visibleChildren }];
      }
      if (!item.visibleTo.includes(role)) return [];
      return [{ item, visibleChildren: [] }];
    });
  }, [role]);

  const width = collapsed ? 56 : 230;
  return (
    <nav
      aria-label="Главное меню"
      style={{
        width,
        flexShrink: 0,
        transition: 'width 0.15s ease',
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-fg)',
        borderRight: '2px solid #000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="wsm-scroll" style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {visible.map(({ item, visibleChildren }) => {
          if (visibleChildren.length === 0 && item.path) {
            return (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                path={item.path}
                collapsed={collapsed}
              />
            );
          }
          const isExpanded = expanded[item.id] ?? true;
          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => setExpanded((s) => ({ ...s, [item.id]: !isExpanded }))}
                title={collapsed ? item.label : undefined}
                aria-expanded={isExpanded}
                style={{
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
                  borderLeft: '3px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16, width: 18, textAlign: 'center' }} aria-hidden="true">
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span aria-hidden="true" style={{ fontSize: 12 }}>
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </>
                )}
              </button>
              {isExpanded &&
                !collapsed &&
                visibleChildren.map((child) => (
                  <SidebarItem
                    key={child.id}
                    label={child.label}
                    path={child.path}
                    collapsed={collapsed}
                    isChild
                  />
                ))}
            </div>
          );
        })}
      </div>
      <ResetButton collapsed={collapsed} />
    </nav>
  );
};
