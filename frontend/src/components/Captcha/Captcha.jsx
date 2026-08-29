import React, { useEffect, useState } from 'react';
import './Captcha.css';
import axios from 'axios';
import { RotateCw, ShieldCheck } from 'lucide-react';

const Captcha = ({ url, onCaptchaChange, isReset }) => {
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const apiUrl = url || "http://localhost:4000";

    const fetchCaptcha = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/auth/captcha`);
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
    }, [isReset, url]);

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
        <div className="captcha-container">
            <div className="captcha-challenge-row">
                <div 
                    className="captcha-svg-wrapper" 
                    title="Security Verification Code"
                >
                    {captchaSvg ? (
                        <div 
                            className="captcha-svg-inner"
                            dangerouslySetInnerHTML={{ __html: captchaSvg }} 
                        />
                    ) : (
                        <div className="captcha-skeleton">
                            <span>Loading code...</span>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className="captcha-refresh-btn"
                    onClick={fetchCaptcha}
                    title="Refresh Security Code"
                    disabled={isLoading}
                >
                    <RotateCw size={16} className={isLoading ? "spin-icon" : ""} />
                </button>
            </div>

            <div className="captcha-input-wrapper">
                <span className="captcha-icon"><ShieldCheck size={16} /></span>
                <input
                    type="text"
                    className="captcha-input-field"
                    placeholder="Enter the 5 characters above"
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

export default Captcha;
