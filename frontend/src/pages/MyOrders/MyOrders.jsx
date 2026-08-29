import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  RotateCw, 
  ShoppingBag, 
  Calendar, 
  ArrowRight,
  Flame,
  Home,
  RefreshCw,
  ShoppingBag as ReorderIcon
} from 'lucide-react';

const OrderCard = ({ order, url, token }) => {
  const { addToCart } = useContext(StoreContext);

  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showTracking, setShowTracking] = useState(true);
  const [status, setStatus] = useState(order.status);
  const [payment, setPayment] = useState(order.payment);

  const navigate = useNavigate();

  useEffect(() => {
    setStatus(order.status);
    setPayment(order.payment);
  }, [order.status, order.payment]);

  const handleTrack = async () => {
    setLoading(true);
    const activeToken = token || localStorage.getItem("token");
    try {
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token: activeToken } });
      if (response.data.success) {
        const currentOrder = response.data.data.find(item => String(item._id) === String(order._id));
        if (currentOrder) {
          setStatus(currentOrder.status);
          setPayment(currentOrder.payment);
        }
      }
    } catch (error) {
      console.log("Error tracking order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async () => {
    setReordering(true);
    try {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const itemId = item._id || item.id;
          const qty = item.quantity || 1;
          for (let i = 0; i < qty; i++) {
            await addToCart(itemId);
          }
        }
      }
      navigate('/cart');
    } catch (err) {
      console.log("Reorder error:", err);
      navigate('/cart');
    } finally {
      setReordering(false);
    }
  };

  const getStatusPill = (statusText) => {
    const s = (statusText || '').toLowerCase();
    if (s.includes('delivered')) {
      return (
        <div className="delivery-status-pill delivered">
          <CheckCircle2 size={14} />
          <span>Delivered</span>
        </div>
      );
    }
    if (s.includes('out for delivery')) {
      return (
        <div className="delivery-status-pill out-for-delivery">
          <Truck size={14} />
          <span>Out for Delivery</span>
        </div>
      );
    }
    if (s.includes('food processing') || s.includes('preparing') || s.includes('processing')) {
      return (
        <div className="delivery-status-pill processing">
          <Flame size={14} />
          <span>Food Processing</span>
        </div>
      );
    }
    return (
      <div className="delivery-status-pill confirmed">
        <CheckCircle2 size={14} />
        <span>Confirmed</span>
      </div>
    );
  };

  const getStepProgress = (statusText) => {
    const s = (statusText || '').toLowerCase();
    if (s.includes('delivered')) return { step: 4, percent: 100 };
    if (s.includes('out for delivery')) return { step: 3, percent: 75 };
    if (s.includes('food processing') || s.includes('preparing') || s.includes('processing')) return { step: 2, percent: 50 };
    return { step: 1, percent: 25 };
  };

  const { step: activeStep, percent: progressPercent } = getStepProgress(status);

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Recent Order';

  return (
    <div className="order-card-wrapper">
      {/* Header Row */}
      <div className="order-card-header">
        <div className="order-id-info">
          <span className="order-id-badge">Order #{String(order._id).slice(-8).toUpperCase()}</span>
          <span className="order-date-text">
            <Calendar size={14} /> {formattedDate}
          </span>
        </div>

        <div className="order-badges-group">
          <span className={`payment-status-pill ${payment ? 'paid' : 'unpaid'}`}>
            {payment ? '● Paid' : '● Unpaid'}
          </span>
          {getStatusPill(status)}
        </div>
      </div>

      {/* Body: Items Preview */}
      <div className="order-card-body">
        <div className="order-items-preview">
          <div className="package-icon-box">
            <Package size={26} color="#ff6347" />
          </div>

          <div className="order-items-text-list">
            <p className="items-summary-text">
              {order.items.map((item, idx) => (
                <span key={idx}>
                  {item.name} <strong>x {item.quantity}</strong>
                  {idx !== order.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
            <span className="items-count-tag">
              Total {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="order-card-footer">
        <div className="order-total-price">
          ₹{order.amount}.00
        </div>

        <div className="order-action-buttons">
          <button 
            className="track-btn" 
            onClick={() => { setShowTracking(!showTracking); handleTrack(); }}
            disabled={loading}
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{showTracking ? 'Refresh Live Status' : 'Track Order'}</span>
          </button>

          <button 
            className="reorder-btn" 
            onClick={handleReorder}
            disabled={reordering}
          >
            <ReorderIcon size={15} />
            <span>{reordering ? 'Adding to Cart...' : 'Reorder Items'}</span>
          </button>
        </div>
      </div>

      {/* Live Order Tracking Stepper Drawer */}
      {showTracking && (
        <div className="live-tracking-drawer">
          <div className="tracking-header-bar">
            <h4>
              <Truck size={18} color="#ff6347" /> 
              Live Order Delivery Status
            </h4>
            <span className="est-delivery-badge">
              {activeStep === 4 ? 'Delivered' : 'Est. Delivery: 25-30 Mins'}
            </span>
          </div>

          <div className="stepper-container">
            <div className="stepper-progress-line-bg"></div>
            <div 
              className="stepper-progress-line-fill" 
              style={{ width: `${progressPercent}%` }}
            ></div>

            {/* Step 1: Order Placed */}
            <div className={`step-item-col ${activeStep >= 1 ? (activeStep > 1 ? 'completed' : 'active') : ''}`}>
              <div className="step-circle-icon">
                <CheckCircle2 size={20} />
              </div>
              <span className="step-label-title">Order Placed</span>
              <span className="step-desc-sub">Order Confirmed</span>
            </div>

            {/* Step 2: Food Processing */}
            <div className={`step-item-col ${activeStep >= 2 ? (activeStep > 2 ? 'completed' : 'active') : ''}`}>
              <div className="step-circle-icon">
                <Flame size={20} />
              </div>
              <span className="step-label-title">Food Processing</span>
              <span className="step-desc-sub">Preparing Meal</span>
            </div>

            {/* Step 3: Out for Delivery */}
            <div className={`step-item-col ${activeStep >= 3 ? (activeStep > 3 ? 'completed' : 'active') : ''}`}>
              <div className="step-circle-icon">
                <Truck size={20} />
              </div>
              <span className="step-label-title">Out for Delivery</span>
              <span className="step-desc-sub">Driver on the way</span>
            </div>

            {/* Step 4: Delivered */}
            <div className={`step-item-col ${activeStep === 4 ? 'completed active' : ''}`}>
              <div className="step-circle-icon">
                <Home size={20} />
              </div>
              <span className="step-label-title">Delivered</span>
              <span className="step-desc-sub">Enjoy your meal!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchOrders = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      if (showSpinner) setLoading(false);
      return;
    }
    try {
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token: activeToken } });
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    const activeToken = token || localStorage.getItem("token");
    if (activeToken) {
      fetchOrders(true);
      const interval = setInterval(() => {
        fetchOrders(false);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="my-orders-page shutter-down">
      <div className="orders-page-header">
        <h1>My Orders & History</h1>
        <p>Track your real-time order status, view ordered items, and check payment confirmation</p>
      </div>

      <div className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <RotateCw size={28} className="animate-spin" style={{ color: '#ff6347', marginBottom: '12px' }} />
            <p>Loading your order history...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-orders-card">
            <div className="empty-orders-icon">
              <ShoppingBag size={40} />
            </div>
            <h2>No Orders Placed Yet</h2>
            <p>You haven't placed any orders yet. Discover delicious dishes from our menu and place your first order!</p>
            <button className="browse-menu-btn" onClick={() => navigate('/')}>
              Browse Menu Now
            </button>
          </div>
        ) : (
          <div className="orders-list-container">
            {data.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                url={url} 
                token={token} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
