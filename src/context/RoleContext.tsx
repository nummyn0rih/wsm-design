import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { PHASE1_ACTIVE_ROLES, type Role } from '@/types/domain';

const LS_KEY = 'wsm:v1:role';
const DEFAULT_ROLE: Role = 'admin';

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function readStoredRole(): Role {
  if (typeof window === 'undefined') return DEFAULT_ROLE;
  const raw = window.localStorage.getItem(LS_KEY);
  if (raw && (PHASE1_ACTIVE_ROLES as string[]).includes(raw)) {
    return raw as Role;
  }
  return DEFAULT_ROLE;
}

export const RoleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => readStoredRole());

  useEffect(() => {
    window.localStorage.setItem(LS_KEY, role);
  }, [role]);

  const setRole = useCallback((r: Role) => {
    if (!(PHASE1_ACTIVE_ROLES as string[]).includes(r)) return;
    setRoleState(r);
  }, []);

  const value = useMemo<RoleContextValue>(() => ({ role, setRole }), [role, setRole]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export function useRole(): RoleContextValue {
  const v = useContext(RoleContext);
  if (!v) throw new Error('useRole must be used inside <RoleProvider>');
  return v;
}
