import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_ROOT = 'http://localhost:8080/api';
const AUTH_API_URL = `${API_ROOT}/auth`;
const ROLES_API_URL = `${API_ROOT}/roles`;

let cachedRolesPromise = null;

const fetchRolesOnce = () => {
    if (!cachedRolesPromise) {
        cachedRolesPromise = axios.get(ROLES_API_URL)
            .then(res => Array.isArray(res.data) ? res.data : [])
            .catch(err => {
                cachedRolesPromise = null;
                throw err;
            });
    }
    return cachedRolesPromise;
};

const hasRoleName = (candidate) => Boolean(
    candidate?.role?.role_name ||
    candidate?.role_name ||
    candidate?.role?.roleName ||
    candidate?.roleName
);

const ensureRoleMetadata = async (rawUser) => {
    if (!rawUser) return rawUser;

    if (hasRoleName(rawUser)) return rawUser;

    const roleId = rawUser.role?.role_id ?? rawUser.role_id ?? rawUser.roleId;
    if (!roleId) return rawUser;

    try {
        const roles = await fetchRolesOnce();
        const match = roles.find(r => Number(r.role_id) === Number(roleId));
        if (!match) return rawUser;

        const normalizedRole = {
            role_id: Number(match.role_id),
            role_name: match.role_name
        };

        return {
            ...rawUser,
            role: { ...(rawUser.role || {}), ...normalizedRole },
            role_id: normalizedRole.role_id,
            role_name: normalizedRole.role_name
        };
    } catch (err) {
        console.warn('Failed to enrich user role metadata', err);
        return rawUser;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pd_user') : null;
        return raw ? JSON.parse(raw) : null;
    });

    useEffect(() => {
        if (user) window.localStorage.setItem('pd_user', JSON.stringify(user));
        else window.localStorage.removeItem('pd_user');
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        const hydrate = async () => {
            if (!user || hasRoleName(user)) return;
            try {
                const hydrated = await ensureRoleMetadata(user);
                if (!cancelled && hydrated !== user) {
                    setUser(hydrated);
                }
            } catch (err) {
                console.warn('Failed to hydrate persisted user role metadata', err);
            }
        };
        hydrate();
        return () => { cancelled = true; };
    }, [user]);

    const login = async (email, password) => {
        const res = await axios.post(`${AUTH_API_URL}/login`, { email, password });
        const hydratedUser = await ensureRoleMetadata(res.data);
        setUser(hydratedUser);
        return hydratedUser;
    };

    const signup = async (name, email, password, role, address, contact) => {
        const res = await axios.post(`${AUTH_API_URL}/signup`, { 
            name, 
            email, 
            password, 
            role, 
            address, 
            contact_number: contact
        });
        const hydratedUser = await ensureRoleMetadata(res.data);
        setUser(hydratedUser);
        return hydratedUser;
    };

    const logout = () => {
        setUser(null);
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    const value = useMemo(() => ({ user, login, signup, logout }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}