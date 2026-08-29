import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import StatCard from '../../components/StatCard/StatCard';
import { SalesOverviewChart, OrderStatusChart } from '../../components/Charts/Charts';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { Users, UtensilsCrossed, Layers, ShoppingBag, IndianRupee, Clock, Activity, Sparkles } from 'lucide-react';
import axios from 'axios';
import { API_URL, sampleDashboardData } from '../../config/api';

const Dashboard = () => {
  const [stats, setStats] = useState(sampleDashboardData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/dashboard/stats`);
      if (res.data && res.data.success && res.data.data) {
        let dashData = res.data.data;
        if (dashData.totalCategories === undefined || dashData.totalCategories === null) {
          try {
            const catRes = await axios.get(`${API_URL}/api/category/list`);
            if (catRes.data && catRes.data.success && Array.isArray(catRes.data.data)) {
              dashData.totalCategories = catRes.data.data.filter(c => c.status !== "Inactive").length;
            } else {
              dashData.totalCategories = 0;
            }
          } catch (cErr) {
            dashData.totalCategories = 0;
          }
        }
        setStats(dashData);
      }
    } catch (err) {
      console.log("Error fetching dashboard stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page fade-in">
      {/* Top Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Welcome back, Admin! <Sparkles size={22} color="#ff4c24" />
          </h2>
          <p>Here is what's happening with your food delivery business today.</p>
        </div>
        <div className="time-badge">
          <Clock size={14} />
          <span>Live Store Status: Active</span>
        </div>
      </div>

      {/* 5 Main Statistics Cards */}
      <div className="stats-grid">
        <StatCard 
          title="Total Users" 
          value={loading ? "..." : (stats.totalUsers || 0)} 
          icon={Users} 
          color="info" 
          change="+12%" 
          isIncrease={true} 
        />
        <StatCard 
          title="Total Products" 
          value={loading ? "..." : (stats.totalProducts || 0)} 
          icon={UtensilsCrossed} 
          color="primary" 
          change="+4" 
          isIncrease={true} 
        />
        <StatCard 
          title="Total Categories" 
          value={loading ? "..." : (stats.totalCategories !== undefined ? stats.totalCategories : 0)} 
          icon={Layers} 
          color="purple" 
          subtitle="All active food sections" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders || 0} 
          icon={ShoppingBag} 
          color="warning" 
          change="+18%" 
          isIncrease={true} 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} 
          icon={IndianRupee} 
          color="success" 
          change="+24%" 
          isIncrease={true} 
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-main">
          <SalesOverviewChart 
            data={stats.salesTrend} 
            totalRevenue={stats.totalRevenue} 
            todaysSales={stats.todaysSales}
            highValue={stats.highValue}
            lowValue={stats.lowValue}
            growth={stats.growthPercentage || 14.8}
          />
        </div>
        <div className="chart-side">
          <OrderStatusChart breakdown={stats.statusBreakdown} />
        </div>
      </div>

      {/* Recent Orders & Activity Stream */}
      <div className="dashboard-bottom-grid">
        {/* Recent Orders Table */}
        <div className="recent-orders-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <span className="view-all-link">Live Updates</span>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order, idx) => (
                    <tr key={order._id || idx}>
                      <td className="font-semibold">#{order._id?.toString().slice(-6) || '9821'}</td>
                      <td>{order.address?.firstName || order.customer || 'Customer'}</td>
                      <td>{order.items ? `${order.items.length} Items` : '1 Item'}</td>
                      <td className="font-semibold">₹{order.amount}</td>
                      <td>
                        <span className={`payment-pill ${order.payment ? 'paid' : 'pending'}`}>
                          {order.payment ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={order.status || 'Pending'} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Statistics & Recent Activity */}
        <div className="activity-card">
          <div className="card-header">
            <h3><Activity size={18} color="#ff4c24" /> Quick Activity</h3>
          </div>

          <div className="activity-feed">
            <div className="activity-item">
              <div className="act-icon order"><ShoppingBag size={14} /></div>
              <div className="act-info">
                <p className="act-text">New order <b>#ORD-9821</b> received from <b>John Doe</b></p>
                <span className="act-time">5 mins ago</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="act-icon payment"><IndianRupee size={14} /></div>
              <div className="act-info">
                <p className="act-text">Payment of <b>₹450.00</b> verified via UPI</p>
                <span className="act-time">12 mins ago</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="act-icon user"><Users size={14} /></div>
              <div className="act-info">
                <p className="act-text">New user <b>Sophia Davis</b> registered</p>
                <span className="act-time">25 mins ago</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="act-icon status"><Clock size={14} /></div>
              <div className="act-info">
                <p className="act-text">Order <b>#ORD-9818</b> updated to <b>Delivered</b></p>
                <span className="act-time">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
