import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const UserRoleContext = createContext();

export function UserRoleProvider({ children }) {
  const { user } = useAuth();
  
  // Get role from the logged-in user's role object
  const role = useMemo(() => {
    if (!user) return null;
    // The user object from backend has a role object with role_name property
    if (user.role && user.role.role_name) {
      return user.role.role_name;
    }
    // Fallback for different possible structures
    if (user.role_name) {
      return user.role_name;
    }
    return null;
  }, [user]);

  const value = useMemo(() => ({ role }), [role]);
  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  return useContext(UserRoleContext);
}


