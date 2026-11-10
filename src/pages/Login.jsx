import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { prefetch } from '../dataCache';
import './Landing.css';
import './Login.css';

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ICONS = {
  mail: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  lock: (
    <svg {...ICON_PROPS}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  eye: (
    <svg {...ICON_PROPS}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg {...ICON_PROPS}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2" />
      <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
    </svg>
  ),
  leaf: (
    <svg {...ICON_PROPS}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19l6-6" />
    </svg>
  ),
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user?.role === 'buyer') {
        prefetch([
          ['buyer:products', '/products'],
          ['buyer:orders', '/orders'],
          ['profile', '/profile'],
        ]);
                navigate('/buyer/dashboard');
      } else {
        prefetch([
          ['farmer:dashboard', '/farmer/dashboard'],
          ['farmer:products', '/farmer/products'],
          ['farmer:orders', '/farmer/orders'],
          ['profile', '/profile'],
        ]);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Mali ang email o password.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing login-page">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link to="/" className="lp-logo">
            <span className="lp-logo-mark">{ICONS.leaf}</span>
            <span>FarmConnect</span>
          </Link>
          <nav className="lp-links">
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/service">Services</Link>
          </nav>
          <div className="lp-nav-actions">
            <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="login-split">
        {/* KALIWA – visual */}
        <section className="login-visual">
          <span className="login-brand">
            <span className="lp-logo-mark">{ICONS.leaf}</span>
            <span>FarmConnect</span>
          </span>
          <div>
            <h2>Connecting Farms to Opportunities.</h2>
            <p>Bringing local farmers and buyers closer through a smarter agricultural marketplace.</p>
          </div>
        </section>

        {/* KANAN – login form */}
        <section className="login-form-side">
          <div className="login-card">
            <h1>Welcome Back!</h1>
            <p className="login-sub">Sign in to your FarmConnect account to continue.</p>

            {error && <div className="login-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">Email Address</label>
                <div className="login-input">
                  {ICONS.mail}
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="login-input">
                  {ICONS.lock}
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="login-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? ICONS.eyeOff : ICONS.eye}
                  </button>
                </div>
              </div>

              <button type="submit" className="lp-btn lp-btn-primary login-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="login-foot">
              Don't have an account yet? <Link to="/register">Create an Account</Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="lp-footer login-footer">
        <div className="lp-wrap lp-copy">© 2026 FarmConnect · Supporting local agriculture.</div>
      </footer>
    </div>
  );
}