import type { FC, ReactNode } from 'react';
import { useRole } from '@/context/RoleContext';
import type { Role } from '@/types/domain';

interface Props {
  allow: Role | Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

export const RoleGate: FC<Props> = ({ allow, fallback = null, children }) => {
  const { role } = useRole();
  const ok = Array.isArray(allow) ? allow.includes(role) : role === allow;
  return <>{ok ? children : fallback}</>;
};
