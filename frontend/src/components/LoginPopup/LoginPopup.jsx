import React, { useContext, useState, useEffect } from 'react';
import './LoginPopup.css';
import { StoreContext } from '../../context/StoreContext';
import Captcha from '../Captcha/Captcha';
import axios from 'axios';
import { X, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginPopup = ({ setShowLogin }) => {

    const { url, setToken, loadCartData } = useContext(StoreContext);
    const backendUrl = url || "http://localhost:4000";

    const [currState, setCurrState] = useState('Login');
    const [data, setData] = useState({ name: '', email: '', password: '' });
    const [captchaData, setCaptchaData] = useState({ captchaId: '', captchaValue: '' });
    const [captchaResetKey, setCaptchaResetKey] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg]         = useState('');
    const [successMsg, setSuccessMsg]     = useState('');
    const [isLoading, setIsLoading]       = useState(false);
    const [agreed, setAgreed]             = useState(true);

    // Lock body scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // Clear error on tab switch
    const switchState = (state) => {
        setCurrState(state);
        setErrorMsg('');
        setSuccessMsg('');
        setData({ name: '', email: '', password: '' });
        setShowPassword(false);
        setCaptchaResetKey(k => k + 1);
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
        setErrorMsg('');
    };

    const handleCaptchaChange = (update) => {
        setCaptchaData(prev => ({ ...prev, ...update }));
        setErrorMsg('');
    };

    const onLogin = async (e) => {
        e.preventDefault();
        if (!agreed) {
            setErrorMsg('Please agree to the Terms of Use & Privacy Policy.');
            return;
        }

        if (!data.email.trim()) {
            setErrorMsg('Please enter your email address.');
            return;
        }

        if (!data.password) {
            setErrorMsg('Please enter your password.');
            return;
        }

        if (!captchaData.captchaValue || captchaData.captchaValue.trim().length === 0) {
            setErrorMsg('Please enter the security verification code.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const endpoint = currState === 'Login'
                ? `${backendUrl}/api/user/login`
                : `${backendUrl}/api/user/register`;

            const payload = {
                ...data,
                captchaId: captchaData.captchaId,
                captchaValue: captchaData.captchaValue.trim()
            };

            const response = await axios.post(endpoint, payload);

            if (response.data && response.data.success) {
                setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                await loadCartData(response.data.token);
                setShowLogin(false);
            } else {
                setErrorMsg(response.data?.message || 'Something went wrong. Please try again.');
                setCaptchaResetKey(k => k + 1);
            }
        } catch (err) {
            const serverMsg = err.response?.data?.message || 'Cannot connect to server. Check your connection.';
            setErrorMsg(serverMsg);
            setCaptchaResetKey(k => k + 1);
        } finally {
            setIsLoading(false);
        }
    };

    const isLogin  = currState === 'Login';
    const btnLabel = isLogin ? 'Sign In' : 'Create Account';

    return (
        <div className="lp-overlay" onClick={() => setShowLogin(false)}>
            <div className="lp-card" onClick={e => e.stopPropagation()}>

                {/* ── Close button ── */}
                <button
                    className="lp-close-btn"
                    onClick={() => setShowLogin(false)}
                    title="Close"
                    type="button"
                >
                    <X size={18} />
                </button>

                {/* ── Brand logo mark ── */}
                <div className="lp-brand-dot" />

                {/* ── Header ── */}
                <div className="lp-header">
                    <h2 className="lp-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="lp-subtitle">
                        {isLogin
                            ? 'Sign in to continue ordering your favourites 🍕'
                            : 'Join us and explore delicious food near you 🎉'}
                    </p>
                </div>

                {/* ── Error banner ── */}
                {errorMsg && (
                    <div className="lp-error">
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* ── Success banner ── */}
                {successMsg && (
                    <div className="lp-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', fontSize: '13px', marginBottom: '8px' }}>
                        <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* ── Form ── */}
                <form className="lp-form" onSubmit={onLogin} noValidate>

                    {/* Name — Sign Up only */}
                    {!isLogin && (
                        <div className="lp-field">
                            <label htmlFor="lp-name">Full Name</label>
                            <div className="lp-input-wrap">
                                <span className="lp-input-icon"><User size={16} /></span>
                                <input
                                    id="lp-name"
                                    name="name"
                                    type="text"
                                    className="lp-input"
                                    placeholder="Your full name"
                                    value={data.name}
                                    onChange={onChangeHandler}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div className="lp-field">
                        <label htmlFor="lp-email">Email Address</label>
                        <div className="lp-input-wrap">
                            <span className="lp-input-icon"><Mail size={16} /></span>
                            <input
                                id="lp-email"
                                name="email"
                                type="email"
                                className="lp-input"
                                placeholder="Enter your email (e.g. patelharsh2953@gmail.com)"
                                value={data.email}
                                onChange={onChangeHandler}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="lp-field">
                        <label htmlFor="lp-password">Password</label>
                        <div className="lp-input-wrap">
                            <span className="lp-input-icon"><Lock size={16} /></span>
                            <input
                                id="lp-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                className="lp-input"
                                placeholder="Enter your password"
                                value={data.password}
                                onChange={onChangeHandler}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                required
                            />
                            <button
                                type="button"
                                className="lp-eye-btn"
                                tabIndex={-1}
                                onClick={() => setShowPassword(v => !v)}
                                title={showPassword ? 'Hide' : 'Show'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* CAPTCHA Verification */}
                    <div className="lp-field">
                        <label>Security Verification</label>
                        <Captcha
                            url={backendUrl}
                            onCaptchaChange={handleCaptchaChange}
                            isReset={captchaResetKey}
                        />
                    </div>

                    {/* Terms checkbox */}
                    <label htmlFor="lp-terms-check" className="lp-terms">
                        <input
                            id="lp-terms-check"
                            type="checkbox"
                            className="lp-checkbox-native"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                        />
                        <span>By continuing, I agree to the <strong>Terms of Use</strong> &amp; <strong>Privacy Policy</strong>.</span>
                    </label>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="lp-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <><span className="lp-spinner" /> {isLogin ? 'Signing in…' : 'Creating account…'}</>
                            : btnLabel
                        }
                    </button>
                </form>

                {/* ── Footer toggle ── */}
                <p className="lp-footer">
                    {isLogin ? (
                        <>Don't have an account?{' '}
                            <button type="button" onClick={() => switchState('Sign Up')}>Create Account</button>
                        </>
                    ) : (
                        <>Already have an account?{' '}
                            <button type="button" onClick={() => switchState('Login')}>Sign In</button>
                        </>
                    )}
                </p>

            </div>
        </div>
    );
};

export default LoginPopup;