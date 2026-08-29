import React from 'react';
import './About.css';
import { useNavigate } from 'react-router-dom';
import { Target, Eye, UtensilsCrossed, Zap, Smartphone, Heart, Star } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* Hero Header */}
      <section className="about-hero">
        <h1>Welcome to <span>Tomato</span> Delivery</h1>
        <p>
          We are passionate about connecting hungry customers with the finest local restaurants. 
          Our mission is to make fresh, delicious meals accessible anytime, anywhere with lightning-fast delivery.
        </p>
        <button className="about-cta-btn" onClick={() => navigate('/')}>
          Explore Our Menu
        </button>
      </section>

      {/* Mission & Vision */}
      <section className="about-grid-2">
        <div className="about-card">
          <div className="card-icon-wrapper">
            <Target size={28} color="#ff6347" />
          </div>
          <h3>Our Mission</h3>
          <p>
            To revolutionize food delivery by blending technology with culinary passion. We aim to support local culinary creators while delivering pure bliss to your doorstep, meal after meal.
          </p>
        </div>
        <div className="about-card">
          <div className="card-icon-wrapper">
            <Eye size={28} color="#ff6347" />
          </div>
          <h3>Our Vision</h3>
          <p>
            To become the most trusted and customer-centric food delivery platform globally, known for exceptional food quality, sustainable packaging, and unrivaled delivery speed.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="section-title-wrapper">
          <h2>Why Choose Tomato?</h2>
          <p>Here is why thousands of foodies trust us every single day</p>
        </div>

        <div className="why-choose-grid">
          <div className="feature-box">
            <div className="feature-icon">
              <UtensilsCrossed size={28} color="#ff6347" />
            </div>
            <h4>Food Quality</h4>
            <p>We partner only with top-rated hygiene-certified restaurants and chefs.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">
              <Zap size={28} color="#ff6347" />
            </div>
            <h4>Fast Delivery</h4>
            <p>Hot and fresh food delivered right to your door in under 30 minutes.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">
              <Smartphone size={28} color="#ff6347" />
            </div>
            <h4>Easy Ordering</h4>
            <p>Seamless online ordering experience with effortless live order tracking.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">
              <Heart size={28} color="#ff6347" />
            </div>
            <h4>Customer Happiness</h4>
            <p>Dedicated 24/7 customer service ready to assist you with every order.</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-banner">
        <div className="stat-item">
          <h3>50,000+</h3>
          <p>Happy Customers</p>
        </div>
        <div className="stat-item">
          <h3>500+</h3>
          <p>Partner Restaurants</p>
        </div>
        <div className="stat-item">
          <h3>100,000+</h3>
          <p>Meals Delivered</p>
        </div>
        <div className="stat-item">
          <h3 style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            4.9 <Star size={22} fill="#f59e0b" color="#f59e0b" />
          </h3>
          <p>User Satisfaction</p>
        </div>
      </section>
    </div>
  );
};

export default About;
