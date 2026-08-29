import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
const AdminAuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
export const AdminAuthProvider = ({ children }) => {
    const [adminToken, setAdminToken]   = useState(null);
    const [adminUser,  setAdminUser]    = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // prevents flicker on first render

    // On mount — restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedUser  = localStorage.getItem('adminUser');

        if (storedToken) {
            setAdminToken(storedToken);
            if (storedUser) {
                try { setAdminUser(JSON.parse(storedUser)); } catch { /* ignore */ }
            }
            // Optionally verify token freshness with backend
            verifyTokenSilently(storedToken);
        } else {
            setAuthLoading(false);
        }
    }, []);

    // Silent token verify — just updates adminUser info if token is still valid
    const verifyTokenSilently = async (token) => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/verify`, {
                headers: { token }
            });
            if (res.data.success) {
                setAdminUser(res.data.admin);
                localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
            } else {
                // Token is invalid/expired — clear it
                _clearAuth();
            }
        } catch {
            // Network error — keep the cached user info, still let them in
        } finally {
            setAuthLoading(false);
        }
    };

    // Called after successful login / register from API
    const login = useCallback((token, user) => {
        setAdminToken(token);
        setAdminUser(user);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
    }, []);

    // Clear all auth state
    const _clearAuth = () => {
        setAdminToken(null);
        setAdminUser(null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    };

    // Called on logout button click
    const logout = useCallback(() => {
        _clearAuth();
    }, []);

    const value = {
        adminToken,
        adminUser,
        authLoading,
        isAuthenticated: !!adminToken,
        login,
        logout
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export const useAdminAuth = () => {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) {
        throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
    }
    return ctx;
};

export default AdminAuthContext;
