import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  ShoppingBag, 
  CreditCard, 
  Banknote,
  ShieldCheck, 
  ArrowRight, 
  Home, 
  Globe, 
  Building,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';

const PlaceOrder = () => {
  const { 
    getTotalCartAmount, 
    token, 
    food_list, 
    cartItems, 
    setCartItems, 
    url,
    appliedCoupon,
    getDiscountAmount,
    getFinalTotalAmount,
    showLogin,
    setShowLogin,
    isLoaded
  } = useContext(StoreContext);

  const subtotal = getTotalCartAmount();
  const discount = getDiscountAmount();
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 500 ? 0 : 60);
  const finalTotal = getFinalTotalAmount();

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("food_del_saved_address");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load saved address:", e);
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      street: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
      phone: ""
    };
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // 'Razorpay' or 'COD'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prev => {
      const updated = { ...prev, [name]: value };
      try {
        localStorage.setItem("food_del_saved_address", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setOrderError('');
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initPay = async (orderData, key, dbOrderId, amount, currency) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      setIsSubmitting(false);
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    const exactAmountInPaise = (orderData && orderData.amount) ? orderData.amount : (amount ? amount : Math.round(finalTotal * 100));

    // Fetch primary food item's photo and item summary
    const primaryItem = cartFoodItems[0];
    const foodImageUrl = primaryItem?.image 
      ? `${url}/images/${primaryItem.image}` 
      : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80";

    const itemsSummary = cartFoodItems
      .map(item => `${item.name} (x${cartItems[item._id]})`)
      .join(', ');

    const paymentTitle = cartFoodItems.length === 1 
      ? `${primaryItem?.name || 'Food Order'}`
      : `${primaryItem?.name || 'Food Order'} + ${cartFoodItems.length - 1} more`;

    const options = {
      key: key || "rzp_test_TVdzv3N18oyQxo",
      amount: exactAmountInPaise,
      currency: (orderData && orderData.currency) ? orderData.currency : (currency || "INR"),
      name: paymentTitle,
      description: `Amount: ₹${finalTotal} • ${itemsSummary}`,
      image: foodImageUrl,
      prefill: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        contact: data.phone
      },
      notes: {
        orderId: dbOrderId,
        primary_dish: primaryItem?.name || 'Food Order',
        food_items: itemsSummary,
        total_amount: `₹${finalTotal}`,
        delivery_address: `${data.street}, ${data.city}, ${data.state} - ${data.pinCode}`
      },
      theme: {
        color: "#ff6347"
      },
      modal: {
        ondismiss: () => {
          setIsSubmitting(false);
        }
      },
      handler: async (response) => {
        try {
          const activeToken = token || localStorage.getItem("token");
          const verifyRes = await axios.post(url + "/api/order/verify", {
            orderId: dbOrderId,
            razorpay_order_id: response.razorpay_order_id || "",
            razorpay_payment_id: response.razorpay_payment_id || "",
            razorpay_signature: response.razorpay_signature || "",
            success: true
          }, { headers: { token: activeToken } });

          if (verifyRes.data.success) {
            if (setCartItems) setCartItems({});
            alert("Payment successful! Your order has been placed.");
            navigate('/myorders');
          } else {
            alert(verifyRes.data.message || "Payment verification failed");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          alert("Error verifying payment");
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    // Attach order_id only if it is a real Razorpay server order ID
    if (orderData && orderData.id && orderData.id.startsWith("order_") && !orderData.id.includes("fallback") && !orderData.id.includes("dummy")) {
      options.order_id = orderData.id;
    }

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsSubmitting(false);
        alert(response.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay open error:", err);
      setIsSubmitting(false);
      alert("Unable to open Razorpay payment gateway.");
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setOrderError('');

    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      setShowLogin(true);
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    if (orderItems.length === 0) {
      setOrderError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setIsSubmitting(true);

    let orderData = {
      address: data,
      items: orderItems,
      amount: finalTotal,
      couponCode: appliedCoupon?.code || "",
      paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Online'
    };

    try {
      let response = await axios.post(url + "/api/order/place", orderData, { headers: { token: activeToken } });
      if (response.data.success) {
        if (response.data.isCOD) {
          if (setCartItems) setCartItems({});
          setIsSubmitting(false);
          alert("Order placed successfully with Cash on Delivery! 🎉");
          navigate('/myorders');
          return;
        }
        const { order, orderId, key, amount, currency } = response.data;
        initPay(order, key, orderId, amount, currency);
      } else {
        setIsSubmitting(false);
        setOrderError(response.data.message || "Error placing order");
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("placeOrder request error:", error);
      setOrderError(error.response?.data?.message || "Error connecting to server. Please try again.");
    }
  };

  const activeToken = token || localStorage.getItem("token");
  const cartFoodItems = food_list.filter((item) => cartItems[item._id] > 0);

  // 1. Loading State
  if (!isLoaded && food_list.length === 0) {
    return (
      <div className="place-order-page shutter-down">
        <div className="loading-checkout-container">
          <Loader2 className="spinner-icon" size={40} color="#ff6347" style={{ margin: '0 auto 16px' }} />
          <h2>Preparing Checkout...</h2>
          <p>Loading your cart items and delivery options, please wait a moment.</p>
        </div>
      </div>
    );
  }

  // 2. Authentication Required State
  if (!activeToken) {
    return (
      <div className="place-order-page shutter-down">
        <div className="auth-required-container">
          <div className="auth-required-icon">
            <Lock size={36} />
          </div>
          <h2>Sign In to Complete Checkout</h2>
          <p>Please sign in or create an account to enter delivery details and place your food order.</p>
          <div className="auth-actions-group">
            <button className="auth-primary-btn" onClick={() => setShowLogin(true)}>
              Sign In / Register
            </button>
            <button className="auth-secondary-btn" onClick={() => navigate('/cart')}>
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty Cart State
  if (isLoaded && cartFoodItems.length === 0 && subtotal === 0) {
    return (
      <div className="place-order-page shutter-down">
        <div className="empty-checkout-container">
          <div className="empty-checkout-icon">
            <ShoppingBag size={36} />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>You have no food items in your cart to checkout. Browse our delicious menu and add your favourites!</p>
          <div className="auth-actions-group">
            <button className="auth-primary-btn" onClick={() => navigate('/')}>
              Browse Menu Now
            </button>
            <button className="auth-secondary-btn" onClick={() => navigate('/cart')}>
              View Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="place-order-page shutter-down">
      <div className="checkout-page-header">
        <h1>Checkout & Delivery Details</h1>
        <p>Please enter your delivery address and choose your payment method</p>
      </div>

      {orderError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <AlertCircle size={18} />
          <span>{orderError}</span>
        </div>
      )}

      <form onSubmit={placeOrder} className="checkout-layout-grid">
        {/* Left Column: Delivery Form Card & Payment Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Delivery Information Card */}
          <div className="delivery-info-card">
            <div className="card-section-title">
              <MapPin size={22} color="#ff6347" />
              <span>Delivery Address Information</span>
            </div>

            <div className="checkout-form-grid">
              {/* First & Last Name */}
              <div className="form-row-2">
                <div className="input-field-wrapper">
                  <label>First Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="field-icon" />
                    <input 
                      required 
                      name="firstName" 
                      onChange={onChangeHandler} 
                      value={data.firstName} 
                      type="text" 
                      placeholder="e.g. Rahul" 
                    />
                  </div>
                </div>

                <div className="input-field-wrapper">
                  <label>Last Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="field-icon" />
                    <input 
                      required 
                      name="lastName" 
                      onChange={onChangeHandler} 
                      value={data.lastName} 
                      type="text" 
                      placeholder="e.g. Sharma" 
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="input-field-wrapper">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input 
                    required 
                    name="email" 
                    onChange={onChangeHandler} 
                    value={data.email} 
                    type="email" 
                    placeholder="name@example.com" 
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="input-field-wrapper">
                <label>Street Address</label>
                <div className="input-with-icon">
                  <Home size={18} className="field-icon" />
                  <input 
                    required 
                    name="street" 
                    onChange={onChangeHandler} 
                    value={data.street} 
                    type="text" 
                    placeholder="House / Flat No., Street, Landmark" 
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="form-row-2">
                <div className="input-field-wrapper">
                  <label>City</label>
                  <div className="input-with-icon">
                    <Building size={18} className="field-icon" />
                    <input 
                      required 
                      name="city" 
                      onChange={onChangeHandler} 
                      value={data.city} 
                      type="text" 
                      placeholder="City" 
                    />
                  </div>
                </div>

                <div className="input-field-wrapper">
                  <label>State</label>
                  <input 
                    required 
                    name="state" 
                    onChange={onChangeHandler} 
                    value={data.state} 
                    type="text" 
                    placeholder="State" 
                    className="plain-input"
                  />
                </div>
              </div>

              {/* Pin Code & Country */}
              <div className="form-row-2">
                <div className="input-field-wrapper">
                  <label>Pin Code / Zip</label>
                  <input 
                    required 
                    name="pinCode" 
                    onChange={onChangeHandler} 
                    value={data.pinCode} 
                    type="text" 
                    placeholder="Pin Code" 
                    className="plain-input"
                  />
                </div>

                <div className="input-field-wrapper">
                  <label>Country</label>
                  <div className="input-with-icon">
                    <Globe size={18} className="field-icon" />
                    <input 
                      required 
                      name="country" 
                      onChange={onChangeHandler} 
                      value={data.country} 
                      type="text" 
                      placeholder="Country" 
                    />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="input-field-wrapper">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="field-icon" />
                  <input 
                    required 
                    name="phone" 
                    onChange={onChangeHandler} 
                    value={data.phone} 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection Card */}
          <div className="payment-method-card">
            <div className="card-section-title" style={{ marginBottom: '16px' }}>
              <CreditCard size={22} color="#ff6347" />
              <span>Select Payment Method</span>
            </div>

            <div className="payment-options-grid">
              {/* Online Payment Option */}
              <div 
                className={`payment-option-tile ${paymentMethod === 'Razorpay' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Razorpay')}
              >
                <div className="radio-dot"></div>
                <div className="tile-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tile-title">Online Payment (Razorpay)</span>
                    <span style={{
                      background: '#e0f2fe',
                      color: '#0284c7',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>Recommended</span>
                  </div>
                  <span className="tile-sub">UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking & Wallets</span>
                </div>
                <ShieldCheck size={20} color="#0284c7" />
              </div>

              {/* Cash on Delivery Option */}
              <div 
                className={`payment-option-tile ${paymentMethod === 'COD' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className="radio-dot"></div>
                <div className="tile-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tile-title">Cash on Delivery (COD)</span>
                  </div>
                  <span className="tile-sub">Pay in cash or UPI when your delicious food is delivered to your doorstep</span>
                </div>
                <Banknote size={20} color="#16a34a" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Bill Breakdown */}
        <div className="checkout-summary-section">
          {/* Ordered Items Mini List Card */}
          <div className="order-items-mini-card">
            <h3>
              <span><ShoppingBag size={18} color="#ff6347" /> Ordered Items</span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                {cartFoodItems.length} {cartFoodItems.length === 1 ? 'item' : 'items'}
              </span>
            </h3>

            <div className="items-mini-list">
              {cartFoodItems.map((item) => (
                <div key={item._id} className="mini-item-row">
                  <div className="mini-item-info">
                    <img 
                      src={`${url}/images/${item.image}`} 
                      alt={item.name} 
                      className="mini-item-img"
                    />
                    <div className="mini-item-text-wrap">
                      <span className="mini-item-name">{item.name}</span>
                      <span className="mini-item-sub">₹{item.price} × {cartItems[item._id]}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span className="mini-item-price">₹{item.price * cartItems[item._id]}</span>
                    <span className="mini-item-qty">{cartItems[item._id]} qty</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Breakdown Card */}
          <div className="checkout-bill-card">
            <h3>Bill Breakdown</h3>

            <div className="bill-rows">
              <div className="bill-row-item">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="bill-row-item discount-row">
                  <span>
                    Coupon Savings 
                    <span className="coupon-code-badge">{appliedCoupon?.code}</span>
                  </span>
                  <span>- ₹{discount}</span>
                </div>
              )}

              <div className="bill-row-item">
                <span>Delivery Partner Fee</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="bill-hr-divider"></div>

              <div className="bill-row-item total-payable-row">
                <span>Total Amount Payable</span>
                <span className="net-total-amount">₹{finalTotal}</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="pay-btn-checkout"
              disabled={isSubmitting || subtotal === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  <span>Processing Order...</span>
                </>
              ) : paymentMethod === 'COD' ? (
                <>
                  <span>Place Cash on Delivery Order (₹{finalTotal})</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <span>Proceed to Online Payment (₹{finalTotal})</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="security-badge-footer">
              <ShieldCheck size={16} color="#16a34a" />
              <span>100% Safe & Secure Payment Experience</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;