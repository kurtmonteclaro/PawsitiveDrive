import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// 🚨 FIX: Define the explicit URL for the backend server
const API_BASE_URL = 'http://localhost:8080/api/auth';

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
        // FIX: Use the explicit API_BASE_URL
        const res = await axios.post(`${API_BASE_URL}/login`, { email, password });
        setUser(res.data);
        return res.data;
    };

    // 🚀 CRITICAL FIX: Added address and contact to parameters and the JSON payload
    const signup = async (name, email, password, role, address, contact) => {
        // FIX: Use the explicit API_BASE_URL
        const res = await axios.post(`${API_BASE_URL}/signup`, { 
            name, 
            email, 
            password, 
            role, 
            address, 
            contact // Sending 'contact' which AuthController expects
        });
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