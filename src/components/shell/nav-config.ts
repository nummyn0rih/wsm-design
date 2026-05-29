import type { Role } from '@/types/domain';

export type StubPhase = 2 | 3;

export interface NavChild {
  id: string;
  label: string;
  path: string;
  visibleTo: Role[];
  phase?: StubPhase;
}

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  visibleTo: Role[];
  path?: string;
  phase?: StubPhase;
  children?: NavChild[];
}

const ALL: Role[] = ['admin', 'operator', 'user'];
const ADMIN: Role[] = ['admin'];

export const NAV: NavItem[] = [
  { id: 'shipments', icon: '📋', label: 'Отгрузки', path: '/shipments', visibleTo: ALL },
  {
    id: 'logistics',
    icon: '📦',
    label: 'Логистика материалов',
    path: '/logistics',
    visibleTo: ADMIN,
    phase: 2,
  },
  {
    id: 'contracts',
    icon: '📄',
    label: 'Контракты',
    path: '/contracts',
    visibleTo: ADMIN,
    phase: 2,
  },
  {
    id: 'analytics',
    icon: '📊',
    label: 'Аналитика',
    path: '/analytics',
    visibleTo: ADMIN,
    phase: 2,
  },
  {
    id: 'notifications',
    icon: '🔔',
    label: 'Уведомления',
    path: '/notifications',
    visibleTo: ADMIN,
    phase: 3,
  },
  {
    id: 'refs',
    icon: '📚',
    label: 'Справочники',
    visibleTo: ALL,
    children: [
      { id: 'ref-raws', label: 'Сырьё', path: '/references/raws', visibleTo: ADMIN, phase: 2 },
      {
        id: 'ref-suppliers',
        label: 'Поставщики',
        path: '/references/suppliers',
        visibleTo: ADMIN,
        phase: 2,
      },
      { id: 'ref-tks', label: 'ТК', path: '/references/tks', visibleTo: ADMIN, phase: 2 },
      {
        id: 'ref-drivers',
        label: 'Водители',
        path: '/references/drivers',
        visibleTo: ALL,
      },
      {
        id: 'ref-tara',
        label: 'Виды тары',
        path: '/references/tara-types',
        visibleTo: ADMIN,
        phase: 2,
      },
      {
        id: 'ref-ingredients',
        label: 'Ингредиенты',
        path: '/references/ingredients',
        visibleTo: ADMIN,
        phase: 2,
      },
      {
        id: 'ref-seasons',
        label: 'Сезоны',
        path: '/references/seasons',
        visibleTo: ADMIN,
        phase: 2,
      },
    ],
  },
  {
    id: 'settings',
    icon: '⚙',
    label: 'Настройки',
    path: '/settings',
    visibleTo: ADMIN,
    phase: 3,
  },
];
