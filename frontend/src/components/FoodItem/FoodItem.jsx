import React, { useContext } from 'react'
import './FoodItem.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Star } from 'lucide-react'

const FoodItem = ({ id, name, price, description, image }) => {

    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)
    const navigate = useNavigate();

    const handleCardClick = (e) => {
        navigate(`/product/${id}`);
    };

    return (
        <div className='food-item' onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="food-item-img-container">
                <img className='food-item-image' src={url + "/images/" + image} alt={name} />
                {!cartItems[id]
                    ? <div 
                        className='add-icon-btn' 
                        onClick={(e) => { e.stopPropagation(); addToCart(id); }} 
                        title="Add to cart"
                      >
                        <Plus size={20} color="#fff" />
                      </div>
                    : <div className='food-item-counter' onClick={(e) => e.stopPropagation()}>
                        <div className="btn-counter-icon remove" onClick={() => removeFromCart(id)}>
                            <Minus size={16} color="#e53e3e" />
                        </div>
                        <p>{cartItems[id]}</p>
                        <div className="btn-counter-icon add-green" onClick={() => addToCart(id)}>
                            <Plus size={16} color="#22c55e" />
                        </div>
                    </div>
                }
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <div className="rating-stars" style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                        ))}
                    </div>
                </div>
                <p className='food-item-desc'>{description}</p>
                <p className='food-item-price'>Rs.{price}</p>
            </div>
        </div>
    )
}

export default FoodItem