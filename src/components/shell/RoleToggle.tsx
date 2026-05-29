import type { FC } from 'react';
import { useRole } from '@/context/RoleContext';
import { PHASE1_ACTIVE_ROLES, ROLE_LABELS, type Role } from '@/types/domain';
import { SegmentedControl, type SegmentOption } from '@/components/atoms/SegmentedControl';

const ROLE_ICON: Record<Role, string> = {
  admin: '👑',
  operator: '🛠',
  user: '👤',
  director: '💼',
};

export const RoleToggle: FC = () => {
  const { role, setRole } = useRole();
  const options: SegmentOption<Role>[] = PHASE1_ACTIVE_ROLES.map((r) => ({
    value: r,
    label: `${ROLE_ICON[r]} ${ROLE_LABELS[r]}`,
  }));
  return (
    <SegmentedControl<Role>
      ariaLabel="Переключатель роли"
      options={options}
      value={role}
      onChange={setRole}
    />
  );
};
