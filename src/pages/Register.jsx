import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Landing.css';
import './Login.css';
import './Register.css';

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
  user: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  mail: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  phone: (
    <svg {...ICON_PROPS}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  ),
  pin: (
    <svg {...ICON_PROPS}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
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
  farmer: (
    <svg {...ICON_PROPS}>
      <path d="M12 21V11" />
      <path d="M12 11c0-4 3-6 7-6 0 4-3 6-7 6z" />
      <path d="M12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" />
    </svg>
  ),
  basket: (
    <svg {...ICON_PROPS}>
      <path d="M3 10h18l-2 9H5l-2-9z" />
      <path d="M8 10l4-6 4 6" />
    </svg>
  ),
  check: (
    <svg {...ICON_PROPS} width={14} height={14} strokeWidth={2.5}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
};

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirm_password: '',
  role: 'buyer',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFarmer = form.role === 'farmer';

  // Live na feedback ng password
  const passwordTooShort = form.password.length > 0 && form.password.length < 6;
  const passwordMismatch =
    form.confirm_password.length > 0 && form.password !== form.confirm_password;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Kailangan ng at least 6 characters ang password.');
      return;
    }

    if (form.password !== form.confirm_password) {
      setError('Hindi magkapareho ang password at confirm password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/register', {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
        role: form.role,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate(res.data.user?.role === 'buyer' ? '/buyer/dashboard' : '/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Hindi natapos ang registration. Subukan ulit.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing login-page register-page">
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
            <Link to="/login" className="lp-signin">Sign In</Link>
          </div>
        </div>
      </header>

      <main className="login-split">
        {/* KALIWA – branding */}
        <section className="login-visual">
          <h2>Be Part of a Growing Community.</h2>
          <p>
            Join FarmConnect and discover new opportunities to connect local farmers with buyers through a convenient digital marketplace.
          </p>
        </section>

        {/* KANAN – form */}
        <section className="login-form-side">
          <div className="login-card">
            <h1>Create Your Account</h1>
            <p className="login-sub">Join FarmConnect and start connecting through our agricultural marketplace.</p>

            {error && <div className="login-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Pagpili ng account type */}
              <fieldset className="reg-roles">
                <legend>I want to register as a:</legend>
                <div className="reg-role-grid">
                  <label className={`reg-role ${form.role === 'farmer' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="farmer"
                      checked={form.role === 'farmer'}
                      onChange={handleChange}
                    />
                    <span className="reg-role-icon">{ICONS.farmer}</span>
                    <span className="reg-role-text">
                      <strong>Farmer</strong>
                      <small>Sell your agricultural products and reach more potential buyers.</small>
                    </span>
                    <span className="reg-check">{ICONS.check}</span>
                  </label>

                  <label className={`reg-role ${form.role === 'buyer' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={form.role === 'buyer'}
                      onChange={handleChange}
                    />
                    <span className="reg-role-icon">{ICONS.basket}</span>
                    <span className="reg-role-text">
                      <strong>Buyer</strong>
                      <small>Discover agricultural products and connect with local farmers.</small>
                    </span>
                    <span className="reg-check">{ICONS.check}</span>
                  </label>
                </div>
              </fieldset>

              <div className="login-field">
                <label htmlFor="full_name">Full Name <span className="reg-req">*</span></label>
                <div className="login-input">
                  {ICONS.user}
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="email">Email Address <span className="reg-req">*</span></label>
                <div className="login-input">
                  {ICONS.mail}
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="phone">Contact Number</label>
                <div className="login-input">
                  {ICONS.phone}
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxxx"
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="address">{isFarmer ? 'Farm Location' : 'Address or Location'}</label>
                <div className="login-input">
                  {ICONS.pin}
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder={isFarmer ? 'Barangay, Bayan (lokasyon ng farm)' : 'Barangay, Bayan'}
                  />
                </div>
              </div>

              <div className="reg-form-row">
                <div className="login-field">
                  <label htmlFor="password">Password <span className="reg-req">*</span></label>
                  <div className="login-input">
                    {ICONS.lock}
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
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
                  {passwordTooShort && (
                    <p className="reg-hint is-bad">Kulang pa, at least 6 characters.</p>
                  )}
                </div>

                <div className="login-field">
                  <label htmlFor="confirm_password">Confirm Password <span className="reg-req">*</span></label>
                  <div className="login-input">
                    {ICONS.lock}
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Ulitin ang password"
                      required
                    />
                    <button
                      type="button"
                      className="login-toggle"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? ICONS.eyeOff : ICONS.eye}
                    </button>
                  </div>
                  {passwordMismatch && (
                    <p className="reg-hint is-bad">Hindi pa magkapareho ang password.</p>
                  )}
                  {!passwordMismatch && form.confirm_password.length > 0 && (
                    <p className="reg-hint is-ok">Magkapareho ang password.</p>
                  )}
                </div>
              </div>

              <button type="submit" className="lp-btn lp-btn-primary login-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="login-foot">
              Already have an account? <Link to="/login">Sign In</Link>
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