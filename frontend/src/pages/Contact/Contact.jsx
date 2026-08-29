import React, { useContext, useState } from 'react';
import './Contact.css';
import { StoreContext } from '../../context/StoreContext';
import Captcha from '../../components/Captcha/Captcha';
import axios from 'axios';
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const Contact = () => {
  const { url } = useContext(StoreContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [captchaData, setCaptchaData] = useState({ captchaId: '', captchaValue: '' });
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 5) {
      newErrors.message = 'Message must be at least 5 characters long';
    }

    if (!captchaData.captchaValue || !captchaData.captchaValue.trim()) {
      newErrors.captcha = 'Please enter the security verification code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCaptchaChange = (update) => {
    setCaptchaData(prev => ({ ...prev, ...update }));
    if (errors.captcha) {
      setErrors(prev => ({ ...prev, captcha: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${url}/api/contacts`, {
        ...formData,
        captchaId: captchaData.captchaId,
        captchaValue: captchaData.captchaValue
      });

      if (response.data.success) {
        setStatusMessage({
          type: 'success',
          text: response.data.message || 'Message sent successfully! We will get back to you soon.'
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setErrors({});
        setCaptchaResetKey(k => k + 1);
      } else {
        setStatusMessage({
          type: 'error',
          text: response.data.message || 'Something went wrong. Please try again.'
        });
        setCaptchaResetKey(k => k + 1);
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to connect to the server. Please check your connection.'
      });
      setCaptchaResetKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Get in <span>Touch</span></h1>
        <p>Have questions about your order, feedback, or business inquiries? We are here to help!</p>
      </div>

      <div className="contact-container">
        {/* Contact Information Box */}
        <div className="contact-info-card">
          <h3>Contact Information</h3>
          <p className="info-subtext">Reach out to us directly through any of the channels below.</p>

          <div className="info-list">
            <div className="info-item">
              <div className="info-icon">
                <MapPin size={22} color="#ff6347" />
              </div>
              <div className="info-details">
                <h4>Our Address</h4>
                <p>123 Foodie Street, Gourmet Avenue, Tech City - 380015</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Phone size={22} color="#ff6347" />
              </div>
              <div className="info-details">
                <h4>Phone Number</h4>
                <p>+91 81530 75224</p>
                <p>+91 98765 43210 (Toll Free)</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Mail size={22} color="#ff6347" />
              </div>
              <div className="info-details">
                <h4>Email Address</h4>
                <p>patelharsh2953@gmail.com</p>
                <p>support@fooddel.com</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Clock size={22} color="#ff6347" />
              </div>
              <div className="info-details">
                <h4>Working Hours</h4>
                <p>Monday - Sunday: 9:00 AM - 11:00 PM</p>
                <p>Customer Support: 24/7 Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Box */}
        <div className="contact-form-card">
          <h3>Send Us a Message</h3>

          {statusMessage.text && (
            <div className={`alert-banner ${statusMessage.type}`}>
              <span>{statusMessage.type === 'success' ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertTriangle size={18} color="#dc2626" />}</span>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form" noValidate>
            <div className="form-row-2">
              <div className="input-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row-2">
              <div className="input-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Order Issue / Feedback"
                  value={formData.subject}
                  onChange={handleChange}
                  className={errors.subject ? 'input-error' : ''}
                />
                {errors.subject && <span className="error-text">{errors.subject}</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="message">Your Message *</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                placeholder="Write your message details here..."
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'input-error' : ''}
              ></textarea>
              {errors.message && <span className="error-text">{errors.message}</span>}
            </div>

            {/* CAPTCHA Protection */}
            <div className="input-group">
              <label>Security Verification *</label>
              <Captcha
                url={url}
                onCaptchaChange={handleCaptchaChange}
                isReset={captchaResetKey}
              />
              {errors.captcha && <span className="error-text">{errors.captcha}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Sending Message...</span>
                </>
              ) : (
                <span>Send Message</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
