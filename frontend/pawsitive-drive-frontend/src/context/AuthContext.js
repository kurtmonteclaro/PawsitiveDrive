import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pd_user') : null;
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) window.localStorage.setItem('pd_user', JSON.stringify(user));
    else window.localStorage.removeItem('pd_user');
  }, [user]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setUser(res.data);
    return res.data;
  };

  const signup = async (name, email, password, role) => {
    const res = await axios.post('/api/auth/signup', { name, email, password, role });
    setUser(res.data);
    return res.data;
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


