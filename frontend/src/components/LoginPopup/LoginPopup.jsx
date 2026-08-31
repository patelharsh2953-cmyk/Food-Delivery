import React, { useContext, useState, useEffect } from 'react';
import './LoginPopup.css';
import { StoreContext } from '../../context/StoreContext';
import Captcha from '../Captcha/Captcha';
import axios from 'axios';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  UserPlus, 
  LogIn, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken, loadCartData } = useContext(StoreContext);
    const backendUrl = url || "http://localhost:4000";

    // Modes: 'Login' | 'Sign Up' | 'Forgot Password'
    const [currState, setCurrState] = useState('Login');
    const [data, setData] = useState({ name: '', email: '', password: '', newPassword: '' });
    const [captchaData, setCaptchaData] = useState({ captchaId: '', captchaValue: '' });
    const [captchaResetKey, setCaptchaResetKey] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [errorType, setErrorType] = useState(''); // 'not_found' | 'wrong_password' | 'general'
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(true);

    // Lock body scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // Tab switcher
    const switchState = (newState) => {
        setCurrState(newState);
        setErrorMsg('');
        setErrorType('');
        setSuccessMsg('');
        setShowPassword(false);
        setCaptchaResetKey(k => k + 1);
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
        setErrorMsg('');
        setErrorType('');
    };

    const handleCaptchaChange = (update) => {
        setCaptchaData(prev => ({ ...prev, ...update }));
        setErrorMsg('');
    };

    const onLogin = async (e) => {
        if (e) e.preventDefault();

        if (currState !== 'Forgot Password' && !agreed) {
            setErrorMsg('Please agree to the Terms of Use & Privacy Policy.');
            return;
        }

        const trimmedEmail = (data.email || '').trim().toLowerCase();
        if (!trimmedEmail) {
            setErrorMsg('Please enter your email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setErrorMsg('Please enter a valid email address (e.g. yourname@example.com).');
            return;
        }

        if (currState === 'Sign Up' && (!data.name || !data.name.trim())) {
            setErrorMsg('Please enter your full name.');
            return;
        }

        if (currState === 'Forgot Password') {
            if (!data.newPassword || data.newPassword.length < 6) {
                setErrorMsg('Please enter a new password (minimum 6 characters).');
                return;
            }
        } else {
            if (!data.password || data.password.length < 4) {
                setErrorMsg('Please enter your password (minimum 4 characters).');
                return;
            }
        }

        setIsLoading(true);
        setErrorMsg('');
        setErrorType('');
        setSuccessMsg('');

        try {
            if (currState === 'Forgot Password') {
                // Reset password endpoint
                const res = await axios.post(`${backendUrl}/api/user/reset-password`, {
                    email: trimmedEmail,
                    newPassword: data.newPassword
                });

                if (res.data && res.data.success) {
                    setSuccessMsg('Password updated successfully! Signing you in...');
                    setToken(res.data.token);
                    localStorage.setItem('token', res.data.token);
                    if (loadCartData) await loadCartData(res.data.token);
                    setTimeout(() => setShowLogin(false), 800);
                } else {
                    setErrorMsg(res.data?.message || 'Failed to reset password.');
                }
                return;
            }

            const endpoint = currState === 'Login'
                ? `${backendUrl}/api/user/login`
                : `${backendUrl}/api/user/register`;

            const payload = {
                name: (data.name || '').trim(),
                email: trimmedEmail,
                password: data.password,
                ...(captchaData.captchaId && captchaData.captchaValue ? {
                    captchaId: captchaData.captchaId,
                    captchaValue: captchaData.captchaValue.trim()
                } : {})
            };

            const response = await axios.post(endpoint, payload);

            if (response.data && response.data.success) {
                setSuccessMsg(currState === 'Login' ? 'Signed in successfully! 🎉' : 'Account created successfully! 🎉');
                setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                if (loadCartData) await loadCartData(response.data.token);
                setTimeout(() => setShowLogin(false), 600);
            } else {
                const msg = response.data?.message || 'Authentication failed.';
                setErrorMsg(msg);
                if (msg.toLowerCase().includes('no account') || msg.toLowerCase().includes('not found')) {
                    setErrorType('not_found');
                } else if (msg.toLowerCase().includes('incorrect password')) {
                    setErrorType('wrong_password');
                }
                setCaptchaResetKey(k => k + 1);
            }
        } catch (err) {
            console.error("Auth request error:", err);
            const serverMsg = err.response?.data?.message || 'Cannot connect to server. Please check your connection.';
            setErrorMsg(serverMsg);
            if (serverMsg.toLowerCase().includes('no account') || serverMsg.toLowerCase().includes('not found')) {
                setErrorType('not_found');
            } else if (serverMsg.toLowerCase().includes('incorrect password') || serverMsg.toLowerCase().includes('invalid credentials')) {
                setErrorType('wrong_password');
            }
            setCaptchaResetKey(k => k + 1);
        } finally {
            setIsLoading(false);
        }
    };

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

                {/* ── Segmented Navigation Tabs ── */}
                <div className="lp-tabs-container">
                    <button
                        type="button"
                        className={`lp-tab-btn ${currState === 'Login' ? 'active' : ''}`}
                        onClick={() => switchState('Login')}
                    >
                        <LogIn size={15} />
                        <span>Sign In</span>
                    </button>
                    <button
                        type="button"
                        className={`lp-tab-btn ${currState === 'Sign Up' ? 'active' : ''}`}
                        onClick={() => switchState('Sign Up')}
                    >
                        <UserPlus size={15} />
                        <span>Create Account</span>
                    </button>
                </div>

                {/* ── Header ── */}
                <div className="lp-header">
                    <h2 className="lp-title">
                        {currState === 'Login' && 'Welcome Back'}
                        {currState === 'Sign Up' && 'Create Free Account'}
                        {currState === 'Forgot Password' && 'Reset Your Password'}
                    </h2>
                    <p className="lp-subtitle">
                        {currState === 'Login' && 'Sign in to order food, track orders, and view past purchases 🍕'}
                        {currState === 'Sign Up' && 'Join in 10 seconds to start ordering delicious hot meals 🎉'}
                        {currState === 'Forgot Password' && 'Enter your account email and choose a new password 🔑'}
                    </p>
                </div>

                {/* ── Error banner ── */}
                {errorMsg && (
                    <div className="lp-error">
                        <AlertCircle size={17} style={{ flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <span>{errorMsg}</span>
                            {errorType === 'not_found' && (
                                <button 
                                    type="button" 
                                    className="lp-inline-action-btn"
                                    onClick={() => switchState('Sign Up')}
                                >
                                    <span>Click here to create a new account with this email</span>
                                    <ArrowRight size={13} />
                                </button>
                            )}
                            {errorType === 'wrong_password' && (
                                <button 
                                    type="button" 
                                    className="lp-inline-action-btn"
                                    onClick={() => switchState('Forgot Password')}
                                >
                                    <span>Forgot password? Click here to set a new password</span>
                                    <ArrowRight size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Success banner ── */}
                {successMsg && (
                    <div className="lp-success">
                        <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* ── Form ── */}
                <form className="lp-form" onSubmit={onLogin} noValidate>

                    {/* Name — Sign Up only */}
                    {currState === 'Sign Up' && (
                        <div className="lp-field">
                            <label htmlFor="lp-name">Full Name</label>
                            <div className="lp-input-wrap">
                                <span className="lp-input-icon"><User size={16} /></span>
                                <input
                                    id="lp-name"
                                    name="name"
                                    type="text"
                                    className="lp-input"
                                    placeholder="e.g. Harsh Patel"
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
                                placeholder="name@example.com"
                                value={data.email}
                                onChange={onChangeHandler}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password — Login / Sign Up */}
                    {currState !== 'Forgot Password' && (
                        <div className="lp-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor="lp-password">Password</label>
                                {currState === 'Login' && (
                                    <button 
                                        type="button" 
                                        className="lp-forgot-link"
                                        onClick={() => switchState('Forgot Password')}
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div className="lp-input-wrap">
                                <span className="lp-input-icon"><Lock size={16} /></span>
                                <input
                                    id="lp-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="lp-input"
                                    placeholder={currState === 'Login' ? 'Enter your account password' : 'Create a strong password (min 6 chars)'}
                                    value={data.password}
                                    onChange={onChangeHandler}
                                    autoComplete={currState === 'Login' ? 'current-password' : 'new-password'}
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
                    )}

                    {/* New Password — Forgot Password Mode */}
                    {currState === 'Forgot Password' && (
                        <div className="lp-field">
                            <label htmlFor="lp-new-password">New Password</label>
                            <div className="lp-input-wrap">
                                <span className="lp-input-icon"><KeyRound size={16} /></span>
                                <input
                                    id="lp-new-password"
                                    name="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    className="lp-input"
                                    placeholder="Enter your new password (min 6 chars)"
                                    value={data.newPassword}
                                    onChange={onChangeHandler}
                                    autoComplete="new-password"
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
                    )}

                    {/* CAPTCHA Verification (Sign In & Sign Up only) */}
                    {currState !== 'Forgot Password' && (
                        <div className="lp-field">
                            <label>Security Verification</label>
                            <Captcha
                                url={backendUrl}
                                onCaptchaChange={handleCaptchaChange}
                                isReset={captchaResetKey}
                            />
                        </div>
                    )}

                    {/* Terms checkbox */}
                    {currState !== 'Forgot Password' && (
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
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="lp-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><span className="lp-spinner" /> Processing...</>
                        ) : currState === 'Login' ? (
                            <><span>Sign In to Account</span> <ArrowRight size={17} /></>
                        ) : currState === 'Sign Up' ? (
                            <><span>Create Account & Sign In</span> <ArrowRight size={17} /></>
                        ) : (
                            <><span>Update Password & Sign In</span> <ArrowRight size={17} /></>
                        )}
                    </button>
                </form>

                {/* ── Footer toggle ── */}
                <div className="lp-footer">
                    {currState === 'Login' && (
                        <p>
                            Don't have an account yet?{' '}
                            <button type="button" onClick={() => switchState('Sign Up')}>
                                Create Free Account
                            </button>
                        </p>
                    )}
                    {currState === 'Sign Up' && (
                        <p>
                            Already have an account?{' '}
                            <button type="button" onClick={() => switchState('Login')}>
                                Sign In here
                            </button>
                        </p>
                    )}
                    {currState === 'Forgot Password' && (
                        <p>
                            Remember your password?{' '}
                            <button type="button" onClick={() => switchState('Login')}>
                                Back to Sign In
                            </button>
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LoginPopup;