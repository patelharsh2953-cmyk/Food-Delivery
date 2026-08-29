import React, { useEffect, useState } from 'react';
import './Notifications.css';
import { Bell, ShoppingBag, CreditCard, UserPlus, Truck, AlertTriangle, CheckCircle, Trash2, Filter } from 'lucide-react';
import axios from 'axios';
import { API_URL, sampleNotifications } from '../../config/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notification/list`);
      if (res.data.success && res.data.data.length > 0) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.log("Using fallback notifications");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post(`${API_URL}/api/notification/read`, {});
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.post(`${API_URL}/api/notification/clear`, {});
      setNotifications([]);
    } catch (err) {
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter(item => {
    if (filterType === 'All') return true;
    return item.type === filterType.toLowerCase();
  });

  return (
    <div className="notifications-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">Admin System Notifications</h2>
          <p className="page-sub-title">Real-time store alerts for orders, payments, dispatches, and user signups</p>
        </div>

        <div className="notif-actions">
          <button className="btn-secondary flex-btn" onClick={handleMarkAllRead}>
            <CheckCircle size={16} /> Mark All as Read
          </button>
          <button className="btn-secondary danger flex-btn" onClick={handleClearAll}>
            <Trash2 size={16} /> Clear Notifications
          </button>
        </div>
      </div>

      <div className="notif-filter-tabs">
        {['All', 'Order', 'Payment', 'User', 'Delivery'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${filterType === tab ? 'active' : ''}`}
            onClick={() => setFilterType(tab)}
          >
            {tab} Alerts
          </button>
        ))}
      </div>

      <div className="notifications-feed-card">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notif-page">
            <Bell size={48} color="#cbd5e1" />
            <h3>No Notifications Found</h3>
            <p>You're all caught up with your admin alerts!</p>
          </div>
        ) : (
          filteredNotifications.map((item, idx) => (
            <div key={item._id || idx} className={`notif-card-row ${!item.read ? 'unread' : ''}`}>
              <div className={`notif-type-icon ${item.type || 'order'}`}>
                {item.type === 'order' && <ShoppingBag size={18} />}
                {item.type === 'payment' && <CreditCard size={18} />}
                {item.type === 'user' && <UserPlus size={18} />}
                {item.type === 'delivery' && <Truck size={18} />}
                {(!item.type || item.type === 'general') && <Bell size={18} />}
              </div>

              <div className="notif-main-content">
                <div className="notif-header-line">
                  <h4>{item.title}</h4>
                  <span className="notif-timestamp">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
                <p className="notif-message">{item.message}</p>
              </div>

              {!item.read && <span className="unread-pulse-dot"></span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
