import React from 'react';
import './Sidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  ShoppingBag, 
  CreditCard, 
  Tag, 
  Mail,
  LogOut,
  X,
  Layers,
  FileText
} from 'lucide-react';
import { assets } from '../../assets/assets';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/products', label: 'Products', icon: UtensilsCrossed },
    { path: '/categories', label: 'Categories', icon: Layers },
    { path: '/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/offers', label: 'Offers', icon: Tag },
    { path: '/contacts', label: 'Contacts', icon: Mail },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully. See you soon! 👋', { autoClose: 2500 });
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Overlay Backdrop for Mobile Drawer */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`} 
        onClick={closeSidebar}
      ></div>

      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
            <img src={assets.logo} alt="FoodDel Logo" className="sidebar-logo" />
            <span className="admin-badge">Admin</span>
          </div>
          <button className="mobile-close-btn" onClick={closeSidebar} title="Close Sidebar">
            <X size={20} color="#49557e" />
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <div className="icon-box">
                  <Icon size={19} />
                </div>
                <span className="link-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;