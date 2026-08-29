import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { sampleNotifications } from '../config/api';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 992);
    const [notifications, setNotifications] = useState(sampleNotifications);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 992) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getPageTitle = (path) => {
        switch (path) {
            case '/dashboard':
            case '/': return 'Admin Dashboard';
            case '/users': return 'User Management';
            case '/products': return 'Food Products Catalog';
            case '/categories': return 'Categories';
            case '/orders': return 'Order Management';
            case '/payments': return 'Payments & Revenue';
            case '/delivery': return 'Delivery Fleet';
            case '/offers': return 'Offers & Coupons';
            case '/notifications': return 'System Notifications';
            case '/contacts': return 'Contact Management';
            default: return 'Admin Panel';
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        if (window.innerWidth <= 992) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className={`app-container ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>

            {/* 1. Left Sidebar Navigation */}
            <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

            {/* 2. Main Wrapper: Top Header (Navbar) + Main Content (<Outlet />) */}
            <div className="main-wrapper">
                <Navbar
                    toggleSidebar={toggleSidebar}
                    pageTitle={getPageTitle(location.pathname)}
                    notifications={notifications}
                    onClearNotifications={() => setNotifications([])}
                />

                {/* Dynamic Route Content */}
                <main className="main-content" style={{ padding: '20px 20px 20px 270px' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
