import React, { useContext, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

const Cart = () => {
  const { 
    cartItems, 
    food_list, 
    addToCart, 
    removeFromCart, 
    setCartItems,
    getTotalCartAmount, 
    url,
    offersList,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getFinalTotalAmount
  } = useContext(StoreContext);

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState({ type: '', message: '' });
  const [isApplying, setIsApplying] = useState(false);

  const navigate = useNavigate();

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponStatus({ type: '', message: '' });

    if (!code) {
      setCouponStatus({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }

    setIsApplying(true);
    const res = await applyCoupon(code);
    setIsApplying(false);

    if (res.success) {
      setCouponStatus({ type: 'success', message: res.message });
      setCouponInput('');
    } else {
      setCouponStatus({ type: 'error', message: res.message });
    }
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const subtotal = getTotalCartAmount();
  const discount = getDiscountAmount();
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 500 ? 0 : 60);
  const finalTotal = getFinalTotalAmount();

  // Find all items in cart
  const cartFoodItems = food_list.filter((item) => cartItems[item._id] > 0);

  if (cartFoodItems.length === 0) {
    return (
      <div className="cart">
        <div className="empty-cart-container">
          <div className="empty-cart-icon">
            <ShoppingBag size={40} />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any delicious food items yet. Explore our menu and satisfy your cravings!</p>
          <button className="explore-menu-btn" onClick={() => navigate('/')}>
            Explore Menu Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart shutter-down">
      <div className="cart-header">
        <h1>Your Food Cart</h1>
        <p>Review your selected dishes, customize quantities, and apply coupons</p>
      </div>

      <div className="cart-layout-grid">
        {/* Left: Items List Card */}
        <div className="cart-items-card">
          <div className="cart-table-header">
            <div>Dish Info</div>
            <div>Price</div>
            <div>Quantity</div>
            <div>Total</div>
            <div></div>
          </div>

          <div className="cart-items-body">
            {cartFoodItems.map((item) => (
              <div key={item._id} className="cart-item-row">
                {/* Dish Info */}
                <div className="item-info-cell">
                  <img 
                    src={`${url}/images/${item.image}`} 
                    alt={item.name} 
                    className="item-img-thumb"
                  />
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <span className="item-cat">{item.category}</span>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="item-price-cell">
                  ₹{item.price}
                </div>

                {/* Quantity Control (+ and -) */}
                <div className="item-quantity-cell">
                  <div className="item-quantity-control">
                    <button 
                      className="qty-btn minus" 
                      onClick={() => removeFromCart(item._id)}
                      title="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-val">{cartItems[item._id]}</span>
                    <button 
                      className="qty-btn plus" 
                      onClick={() => addToCart(item._id)}
                      title="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Row Subtotal */}
                <div className="item-total-cell">
                  ₹{item.price * cartItems[item._id]}
                </div>

                {/* Remove Item Button */}
                <div className="item-actions-cell">
                  <button 
                    className="item-delete-btn" 
                    onClick={() => handleRemoveItem(item._id)}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Bill Breakdown & Coupon Offers */}
        <div className="cart-summary-section">
          {/* Coupon Offers Card */}
          <div className="coupon-card">
            <h4><Tag size={18} color="#ff6347" /> Apply Coupon Code</h4>
            
            <div className="coupon-input-group">
              <input 
                type="text" 
                placeholder="ENTER COUPON (e.g. FOOD20)" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(couponInput); }}
              />
              <button 
                onClick={() => handleApplyCoupon(couponInput)}
                disabled={isApplying}
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            </div>

            {couponStatus.message && (
              <div className={`coupon-alert ${couponStatus.type}`}>
                {couponStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{couponStatus.message}</span>
              </div>
            )}

            {/* Applied Coupon Banner */}
            {appliedCoupon && (
              <div className="applied-coupon-banner">
                <div className="applied-coupon-info">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>
                    Coupon <strong className="applied-code">{appliedCoupon.code}</strong> applied! 
                    {discount > 0 ? ` Saved ₹${discount}` : ''}
                  </span>
                </div>
                <button 
                  className="remove-btn" 
                  onClick={() => { removeCoupon(); setCouponStatus({ type: '', message: '' }); }}
                  title="Remove coupon"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Available Admin Launched Offers Chips */}
            {offersList && offersList.length > 0 && (
              <div className="available-offers-box">
                <p>Available Offers</p>
                <div className="offer-chips-wrapper">
                  {offersList.filter(o => o.status === 'Active' && !o.isDeleted).map((off) => (
                    <button 
                      key={off._id || off.code} 
                      className={`offer-chip ${appliedCoupon?.code === off.code ? 'active-chip' : ''}`}
                      onClick={() => handleApplyCoupon(off.code)}
                      title={`Minimum order: ₹${off.minAmount || 0}`}
                    >
                      <span className="chip-code">{off.code}</span>
                      <span className="chip-disc">{off.discount}% OFF</span>
                      {off.minAmount > 0 && <span className="chip-min">(Min ₹{off.minAmount})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bill Breakdown Card */}
          <div className="bill-breakdown-card">
            <h3>Bill Breakdown</h3>
            
            <div className="bill-rows-container">
              <div className="bill-row">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="bill-row discount-row">
                  <span>
                    Coupon Discount 
                    <span className="coupon-tag-badge">{appliedCoupon?.code}</span>
                  </span>
                  <span>- ₹{discount}</span>
                </div>
              )}

              <div className="bill-row">
                <span>Delivery Partner Fee</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE (Orders &gt; ₹500)</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="bill-divider"></div>

              <div className="bill-row total-row">
                <span>Total Amount</span>
                <span className="final-amount-text">₹{finalTotal}</span>
              </div>
            </div>

            <button 
              className="checkout-btn" 
              onClick={() => navigate('/order')} 
              disabled={subtotal === 0}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
