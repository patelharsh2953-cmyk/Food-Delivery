import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

/**
 * AdminProtectedRoute
 *
 * Wraps all admin dashboard routes. While auth state is being
 * restored from localStorage, shows a minimal full-screen loader
 * to prevent content flicker. Once resolved:
 *  - Authenticated  → render the nested <Outlet />
 *  - Unauthenticated → redirect to /login
 */
const AdminProtectedRoute = () => {
    const { isAuthenticated, authLoading } = useAdminAuth();

    // Show a clean loading screen while checking localStorage / verifying token
    if (authLoading) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fcfcfc',
                gap: '16px',
                zIndex: 9999
            }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    border: '3px solid #ffd1c7',
                    borderTopColor: '#ff4c24',
                    borderRadius: '50%',
                    animation: 'spin 0.75s linear infinite'
                }} />
                <p style={{ color: '#676767', fontSize: '14px', fontFamily: "'Outfit', sans-serif" }}>
                    Verifying session…
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Not authenticated → push to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated → render the child route
    return <Outlet />;
};

export default AdminProtectedRoute;
