import React, { useEffect, useState } from 'react';
import './Captcha.css';
import axios from 'axios';
import { RotateCw, ShieldCheck } from 'lucide-react';
import { API_URL } from '../../config/api';

const AdminCaptcha = ({ onCaptchaChange, isReset }) => {
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const baseUrl = API_URL || "http://localhost:4000";

    const fetchCaptcha = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/api/auth/captcha`);
            if (res.data && res.data.success) {
                setCaptchaSvg(res.data.svg);
                setCaptchaInput('');
                if (onCaptchaChange) {
                    onCaptchaChange({
                        captchaId: res.data.captchaId,
                        captchaValue: ''
                    });
                }
            }
        } catch (err) {
            console.error("Error loading captcha:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, [isReset]);

    const handleInputChange = (e) => {
        const val = e.target.value.toUpperCase();
        setCaptchaInput(val);
        if (onCaptchaChange) {
            onCaptchaChange({
                captchaValue: val
            });
        }
    };

    return (
        <div className="admin-captcha-container">
            <label className="admin-captcha-label">Security Verification</label>
            <div className="admin-captcha-challenge-row">
                <div 
                    className="admin-captcha-svg-wrapper" 
                    title="Security Verification"
                >
                    {captchaSvg ? (
                        <div 
                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            dangerouslySetInnerHTML={{ __html: captchaSvg }} 
                        />
                    ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Loading code...</span>
                    )}
                </div>
                <button
                    type="button"
                    className="admin-captcha-refresh-btn"
                    onClick={fetchCaptcha}
                    title="Refresh Security Code"
                    disabled={isLoading}
                >
                    <RotateCw size={16} className={isLoading ? "spin-icon" : ""} />
                </button>
            </div>

            <div className="admin-captcha-input-wrapper">
                <span className="admin-captcha-icon"><ShieldCheck size={16} /></span>
                <input
                    type="text"
                    className="admin-captcha-input-field"
                    placeholder="Enter 5-digit code"
                    value={captchaInput}
                    onChange={handleInputChange}
                    maxLength={6}
                    autoComplete="off"
                    required
                />
            </div>
        </div>
    );
};

export default AdminCaptcha;
