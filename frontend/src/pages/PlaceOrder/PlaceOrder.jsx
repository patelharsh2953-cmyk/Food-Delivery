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
  ShieldCheck, 
  ArrowRight, 
  Home, 
  Globe, 
  Building,
  CheckCircle2
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
    getFinalTotalAmount
  } = useContext(StoreContext);

  const subtotal = getTotalCartAmount();
  const discount = getDiscountAmount();
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 500 ? 0 : 60);
  const finalTotal = getFinalTotalAmount();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    phone: ""
  });

  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
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
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    // Exact amount in paise (e.g. ₹270 = 27000 paise)
    const exactAmountInPaise = (orderData && orderData.amount) ? orderData.amount : (amount ? amount : Math.round(finalTotal * 100));

    const options = {
      key: key || "rzp_test_T7r2m2f2DSkplw",
      amount: exactAmountInPaise,
      currency: (orderData && orderData.currency) ? orderData.currency : (currency || "INR"),
      name: "Tomato Food Delivery",
      description: `Food Order Payment - Total ₹${finalTotal}`,
      prefill: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        contact: data.phone
      },
      theme: {
        color: "#ff6347"
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
          console.log(error);
          alert("Error verifying payment");
        }
      }
    };

    if (orderData && orderData.id && !orderData.id.startsWith("order_")) {
      options.order_id = orderData.id;
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: finalTotal,
      couponCode: appliedCoupon?.code || "",
      paymentMethod: paymentMethod
    };

    const activeToken = token || localStorage.getItem("token");
    try {
      let response = await axios.post(url + "/api/order/place", orderData, { headers: { token: activeToken } });
      if (response.data.success) {
        if (response.data.isCOD) {
          if (setCartItems) setCartItems({});
          alert("Order placed successfully with Cash on Delivery!");
          navigate('/myorders');
          return;
        }
        const { order, orderId, key, amount, currency } = response.data;
        initPay(order, key, orderId, amount, currency);
      } else {
        alert(response.data.message || "Error placing order");
      }
    } catch (error) {
      console.log(error);
      alert("Error connecting to server");
    }
  };

  useEffect(() => {
    if (!token && !localStorage.getItem("token")) {
      navigate('/cart');
    } else if (subtotal === 0) {
      navigate('/cart');
    }
  }, [token, subtotal]);

  // Selected cart items
  const cartFoodItems = food_list.filter((item) => cartItems[item._id] > 0);

  return (
    <div className="place-order-page shutter-down">
      <div className="checkout-page-header">
        <h1>Checkout & Delivery Details</h1>
        <p>Please enter your delivery address and review your final bill before payment</p>
      </div>

      <form onSubmit={placeOrder} className="checkout-layout-grid">
        {/* Left Column: Delivery Form Card */}
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
                  type="text" 
                  placeholder="+91 98765 43210" 
                />
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
                    <span className="mini-item-qty">{cartItems[item._id]}x</span>
                    <span className="mini-item-name">{item.name}</span>
                  </div>
                  <span className="mini-item-price">₹{item.price * cartItems[item._id]}</span>
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

            <button type="submit" className="pay-btn-checkout">
              <span>Proceed to Payment (₹{finalTotal})</span>
              <ArrowRight size={18} />
            </button>

            <div className="security-badge-footer">
              <ShieldCheck size={16} color="#16a34a" />
              <span>256-bit Encrypted & Secure Razorpay Payment Gateway</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;