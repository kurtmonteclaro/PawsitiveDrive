import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const ADMIN_ROLE_IDS = new Set([2]);
const UserRoleContext = createContext();

const normalize = (value) => (value ? String(value).trim() : null);

export function UserRoleProvider({ children }) {
  const { user } = useAuth();
  
  const role = useMemo(() => {
    if (!user) return null;

    const named =
      normalize(user.role?.role_name) ||
      normalize(user.role_name) ||
      normalize(user.role?.roleName) ||
      normalize(user.roleName);
    if (named) return named;

    const roleId = user.role?.role_id ?? user.role_id ?? user.roleId;
    if (roleId && ADMIN_ROLE_IDS.has(Number(roleId))) {
      return 'Admin';
    }
    return null;
  }, [user]);

  const value = useMemo(() => ({ role }), [role]);
  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  return useContext(UserRoleContext);
}


