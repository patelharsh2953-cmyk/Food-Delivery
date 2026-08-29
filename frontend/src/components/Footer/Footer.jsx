import React from 'react'
import logo from '../../assets/logo.png'
import './Footer.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const LinkedinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Footer = () => {
    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={assets.logo} alt="" />
                    <p>Tomato delivers fresh and delicious meals right to your doorstep.<br /> Order your favorite food anytime, anywhere.</p>
                    <div className="footer-social-icons">
                        <div className="social-icon-wrapper"><FacebookIcon size={20} /></div>
                        <div className="social-icon-wrapper"><TwitterIcon size={20} /></div>
                        <div className="social-icon-wrapper"><LinkedinIcon size={20} /></div>
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
                        <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About us</Link></li>
                        <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link></li>
                        <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Delivery Info</Link></li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>+91 81530 75224</li>
                        <li>patelharsh2953@gmail.com</li>
                    </ul>
                </div>
            </div>
            <hr />
            <p className='footer-copyright'>Copyright 2026 © Tomato.com - All Rights Reserved.</p>
        </div>
    )
}

export default Footer

