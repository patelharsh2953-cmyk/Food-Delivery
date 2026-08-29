import React, { useContext, useState } from 'react';
import './ProductDetails.css';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { ArrowLeft, Star, Minus, Plus, Sparkles } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { 
    food_list, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    url, 
    offersList, 
    applyCoupon 
  } = useContext(StoreContext);

  const [copyStatus, setCopyStatus] = useState('');

  // Find product by id
  const item = food_list.find((prod) => prod._id === id);

  if (!item) {
    return (
      <div className="product-details-page">
        <button className="back-nav-btn" onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Menu
        </button>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Product Not Found</h2>
          <p style={{ color: '#808080', marginTop: '10px' }}>
            The food item you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const handleApplyCouponFromProduct = async (code) => {
    const res = await applyCoupon(code);
    if (res.success) {
      setCopyStatus(`Coupon '${code}' selected! Proceed to Cart to view savings.`);
    } else {
      setCopyStatus(res.message);
    }
  };

  const discountVal = item.discount || 0;
  const originalPrice = discountVal > 0 ? Math.round((item.price * 100) / (100 - discountVal)) : null;

  return (
    <div className="product-details-page shutter-down">
      <button className="back-nav-btn" onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <ArrowLeft size={16} /> Back to Menu
      </button>

      <div className="details-container">
        {/* Left: Food Image */}
        <div className="details-image-box">
          <img src={`${url}/images/${item.image}`} alt={item.name} />
          <span className="details-category-badge">{item.category}</span>
        </div>

        {/* Right: Info & Actions */}
        <div className="details-info-box">
          <div className="details-title-row">
            <h1>{item.name}</h1>
            <div className="details-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span className="rating-score">4.9</span>
            </div>
          </div>

          <div className="details-price-row">
            <span className="main-price">₹{item.price}</span>
            {originalPrice && <span className="original-price">₹{originalPrice}</span>}
            {discountVal > 0 && <span className="discount-tag-badge">{discountVal}% OFF</span>}
          </div>

          <p className="details-desc">{item.description}</p>

          <div className={`stock-status-tag ${item.availability !== false ? 'in-stock' : 'out-stock'}`}>
            <span>{item.availability !== false ? '● In Stock' : '● Currently Unavailable'}</span>
          </div>

          {/* Cart Quantity Actions */}
          <div className="details-actions">
            {!cartItems[id] ? (
              <button className="add-cart-btn" onClick={() => addToCart(id)}>
                Add to Cart • ₹{item.price}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%' }}>
                <div className="quantity-counter-box" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="counter-icon-btn remove" onClick={() => removeFromCart(id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={16} color="#e53e3e" />
                  </div>
                  <span>{cartItems[id]}</span>
                  <div className="counter-icon-btn add" onClick={() => addToCart(id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={16} color="#22c55e" />
                  </div>
                </div>
                <button className="add-cart-btn" onClick={() => navigate('/cart')}>
                  View in Cart ({cartItems[id]})
                </button>
              </div>
            )}
          </div>

          {/* Admin Offers Section */}
          {offersList && offersList.length > 0 && (
            <div className="details-offers-section">
              <div className="offers-header-title">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} color="#ff6347" /> Exclusive Promotional Coupons
                </span>
              </div>

              {copyStatus && (
                <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '500', marginBottom: '10px' }}>
                  {copyStatus}
                </div>
              )}

              <div className="offers-list-container">
                {offersList.filter(o => o.status === 'Active').slice(0, 3).map((offer) => (
                  <div key={offer._id || offer.code} className="offer-coupon-chip">
                    <div>
                      <span className="chip-code">{offer.code}</span>
                      <span className="chip-desc">
                        {' '}• Get {offer.discount}% OFF {offer.minAmount > 0 ? `on orders above ₹${offer.minAmount}` : ''}
                      </span>
                    </div>
                    <button 
                      className="use-coupon-btn"
                      onClick={() => handleApplyCouponFromProduct(offer.code)}
                    >
                      Use Code
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
