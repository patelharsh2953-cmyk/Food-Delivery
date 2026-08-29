import React, { useState } from 'react';
import './AdminLogin.css';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import { assets } from '../../assets/assets';
import AdminCaptcha from '../../components/Captcha/Captcha';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    LogIn,
    UserPlus,
    AlertCircle
} from 'lucide-react';

// ─────────────────────────────────────────
//  AdminLogin — tabbed Login / Register UI with Security Verification
// ─────────────────────────────────────────
const AdminLogin = () => {
    const navigate  = useNavigate();
    const { login } = useAdminAuth();

    const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg,  setErrorMsg]  = useState('');

    // CAPTCHA state
    const [captchaData, setCaptchaData] = useState({ captchaId: '', captchaValue: '' });
    const [captchaResetKey, setCaptchaResetKey] = useState(0);

    // ── Login form state ──
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    // ── Register form state ──
    const [regData, setRegData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Password visibility toggles
    const [showLoginPwd,   setShowLoginPwd]   = useState(false);
    const [showRegPwd,     setShowRegPwd]      = useState(false);
    const [showRegConfPwd, setShowRegConfPwd]  = useState(false);

    // ────────────────────────────────────────
    const switchTab = (tab) => {
        setActiveTab(tab);
        setErrorMsg('');
        setCaptchaResetKey(k => k + 1);
    };

    const handleCaptchaChange = (update) => {
        setCaptchaData(prev => ({ ...prev, ...update }));
        setErrorMsg('');
    };

    // ────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!loginData.email || !loginData.password) {
            setErrorMsg('Please fill in all fields.');
            return;
        }

        if (!captchaData.captchaValue || !captchaData.captchaValue.trim()) {
            setErrorMsg('Please enter the security verification code.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/admin/login`, {
                email:    loginData.email,
                password: loginData.password,
                captchaId: captchaData.captchaId,
                captchaValue: captchaData.captchaValue
            });

            if (res.data.success) {
                login(res.data.token, res.data.admin);
                toast.success(`Welcome back, ${res.data.admin.name}! 👋`);
                navigate('/dashboard', { replace: true });
            } else {
                setErrorMsg(res.data.message || 'Login failed. Please try again.');
                setCaptchaResetKey(k => k + 1);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Cannot connect to server. Please check your connection.');
            setCaptchaResetKey(k => k + 1);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // ────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const { name, email, password, confirmPassword } = regData;

        if (!name || !email || !password || !confirmPassword) {
            setErrorMsg('All fields are required.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setErrorMsg('Password must be at least 8 characters.');
            return;
        }

        if (!captchaData.captchaValue || !captchaData.captchaValue.trim()) {
            setErrorMsg('Please enter the security verification code.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/admin/register`, {
                name,
                email,
                password,
                confirmPassword,
                captchaId: captchaData.captchaId,
                captchaValue: captchaData.captchaValue
            });

            if (res.data.success) {
                login(res.data.token, res.data.admin);
                toast.success(`Admin account created! Welcome, ${res.data.admin.name} 🎉`);
                navigate('/dashboard', { replace: true });
            } else {
                setErrorMsg(res.data.message || 'Registration failed. Please try again.');
                setCaptchaResetKey(k => k + 1);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Cannot connect to server. Please check your connection.');
            setCaptchaResetKey(k => k + 1);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // ────────────────────────────────────────
    return (
        <div className="auth-page">
            {/* Animated background blobs */}
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />
            <div className="auth-blob auth-blob-3" />
            <div className="auth-grid-overlay" />

            {/* ── Auth Card ── */}
            <div className="auth-card">

                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-logo-wrap">
                        <img src={assets.logo} alt="FoodDel" />
                    </div>
                    <p className="auth-brand-name">Food<span>Del</span> Admin</p>
                    <p className="auth-subtitle">
                        {activeTab === 'login'
                            ? 'Sign in to manage your restaurant panel'
                            : 'Create a new admin account'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="auth-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'login'}
                        id="tab-login"
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => switchTab('login')}
                    >
                        <LogIn size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Login
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'register'}
                        id="tab-register"
                        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => switchTab('register')}
                    >
                        <UserPlus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Register
                    </button>
                </div>

                {/* Error banner */}
                {errorMsg && (
                    <div className="auth-error">
                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                        {errorMsg}
                    </div>
                )}

                {/* ════════════════════════════════
                     LOGIN PANEL
                ════════════════════════════════ */}
                {activeTab === 'login' && (
                    <div className="auth-panel" key="login-panel">
                        <form className="auth-form" onSubmit={handleLogin} noValidate>

                            {/* Email */}
                            <div className="input-group">
                                <label htmlFor="login-email">Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><Mail size={16} /></span>
                                    <input
                                        id="login-email"
                                        type="email"
                                        className="auth-input"
                                        placeholder="admin@fooddel.com"
                                        value={loginData.email}
                                        autoComplete="email"
                                        onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label htmlFor="login-password">Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><Lock size={16} /></span>
                                    <input
                                        id="login-password"
                                        type={showLoginPwd ? 'text' : 'password'}
                                        className="auth-input"
                                        placeholder="Enter your password"
                                        value={loginData.password}
                                        autoComplete="current-password"
                                        onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        className="input-suffix"
                                        title={showLoginPwd ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowLoginPwd(v => !v)}
                                        tabIndex={-1}
                                    >
                                        {showLoginPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* CAPTCHA Security Verification */}
                            <AdminCaptcha
                                onCaptchaChange={handleCaptchaChange}
                                isReset={captchaResetKey}
                            />

                            {/* Remember Me */}
                            <div className="auth-extras">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={loginData.rememberMe}
                                        onChange={e => setLoginData(p => ({ ...p, rememberMe: e.target.checked }))}
                                    />
                                    Remember me
                                </label>
                            </div>

                            <button
                                id="admin-login-btn"
                                type="submit"
                                className="auth-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? <><div className="btn-spinner" /> Signing in…</>
                                    : <><LogIn size={16} /> Sign In to Admin Panel</>
                                }
                            </button>
                        </form>
                    </div>
                )}

                {/* ════════════════════════════════
                     REGISTER PANEL
                ════════════════════════════════ */}
                {activeTab === 'register' && (
                    <div className="auth-panel" key="register-panel">
                        <form className="auth-form" onSubmit={handleRegister} noValidate>

                            {/* Full Name */}
                            <div className="input-group">
                                <label htmlFor="reg-name">Full Name</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><User size={16} /></span>
                                    <input
                                        id="reg-name"
                                        type="text"
                                        className="auth-input"
                                        placeholder="Admin Manager"
                                        value={regData.name}
                                        onChange={e => setRegData(p => ({ ...p, name: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="input-group">
                                <label htmlFor="reg-email">Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><Mail size={16} /></span>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        className="auth-input"
                                        placeholder="admin@fooddel.com"
                                        value={regData.email}
                                        autoComplete="email"
                                        onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label htmlFor="reg-password">Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><Lock size={16} /></span>
                                    <input
                                        id="reg-password"
                                        type={showRegPwd ? 'text' : 'password'}
                                        className="auth-input"
                                        placeholder="Min. 8 characters"
                                        value={regData.password}
                                        autoComplete="new-password"
                                        onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        className="input-suffix"
                                        title={showRegPwd ? 'Hide' : 'Show'}
                                        onClick={() => setShowRegPwd(v => !v)}
                                        tabIndex={-1}
                                    >
                                        {showRegPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="input-group">
                                <label htmlFor="reg-confirm">Confirm Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><Lock size={16} /></span>
                                    <input
                                        id="reg-confirm"
                                        type={showRegConfPwd ? 'text' : 'password'}
                                        className="auth-input"
                                        placeholder="Repeat your password"
                                        value={regData.confirmPassword}
                                        autoComplete="new-password"
                                        onChange={e => setRegData(p => ({ ...p, confirmPassword: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        className="input-suffix"
                                        title={showRegConfPwd ? 'Hide' : 'Show'}
                                        onClick={() => setShowRegConfPwd(v => !v)}
                                        tabIndex={-1}
                                    >
                                        {showRegConfPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* CAPTCHA Security Verification */}
                            <AdminCaptcha
                                onCaptchaChange={handleCaptchaChange}
                                isReset={captchaResetKey}
                            />

                            <button
                                id="admin-register-btn"
                                type="submit"
                                className="auth-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? <><div className="btn-spinner" /> Creating account…</>
                                    : <><UserPlus size={16} /> Create Admin Account</>
                                }
                            </button>
                        </form>
                    </div>
                )}

                {/* Footer tab switch */}
                <p className="auth-footer-note">
                    {activeTab === 'login' ? (
                        <>Don't have an admin account?{' '}
                            <button onClick={() => switchTab('register')}>Create Account</button>
                        </>
                    ) : (
                        <>Already have an admin account?{' '}
                            <button onClick={() => switchTab('login')}>Sign In</button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
