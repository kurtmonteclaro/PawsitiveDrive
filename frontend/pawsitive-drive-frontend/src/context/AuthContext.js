import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

// Configure axios defaults - use full URL to avoid proxy issues
const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pd_user') : null;
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      try {
        window.localStorage.setItem('pd_user', JSON.stringify(user));
      } catch (e) {
        console.error('Error saving user to localStorage:', e);
      }
    } else {
      window.localStorage.removeItem('pd_user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const res = await apiClient.post('/api/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      if (res.data && res.data.user_id) {
        setUser(res.data);
        return res.data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'Login failed';
        console.error('Error message:', message);
        throw new Error(message);
      }
      if (error.request) {
        console.error('No response received. Is the backend running?');
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 8080.');
      }
      throw new Error('Network error. Please check your connection.');
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      console.log('Attempting signup:', { name, email, role });
      const res = await apiClient.post('/api/auth/signup', { name, email, password, role });
      console.log('Signup response:', res.data);
      
      if (res.data && res.data.user_id) {
        setUser(res.data);
        return res.data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'Registration failed';
        console.error('Error message:', message);
        console.error('Full error response:', error.response.data);
        throw new Error(message);
      }
      if (error.request) {
        console.error('No response received. Is the backend running?');
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 8080.');
      }
      throw new Error('Network error. Please check your connection.');
    }
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('pd_user');
  };

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


