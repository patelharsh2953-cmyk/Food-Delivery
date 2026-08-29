import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { sampleNotifications } from '../../config/api';

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
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Admin Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        <Navbar 
          toggleSidebar={toggleSidebar} 
          pageTitle={getPageTitle(location.pathname)}
          notifications={notifications}
          onClearNotifications={() => setNotifications([])}
        />

        {/* Page Content Outlet */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
