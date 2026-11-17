import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { prefetch } from '../dataCache';
import './Landing.css';
import './Login.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

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

/** Ikinakarga ang Google Identity Services script nang isang beses lang. */
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${GSI_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google script failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed'));
    document.head.appendChild(script);
  });
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loading, setLoading] = useState(false);
  // Kapag bagong Gmail, dito itinatago ang credential habang pumipili ang user ng role
  const [pendingCredential, setPendingCredential] = useState(null);
  const [pendingName, setPendingName] = useState('');
  const googleBtnRef = useRef(null);

  /** Pagkatapos ng matagumpay na login, i-save ang session at pumunta sa tamang page ayon sa role. */
  function finishLogin(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    const role = data.user?.role;

    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'buyer') {
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
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', { email, password });
      finishLogin(res.data);
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

  /** Tinatawag ng Google button pagkatapos pumili ng Gmail account. */
  async function handleGoogleCredential(response) {
    setError('');
    setGoogleError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/google', { credential: response.credential });

      if (res.data.needs_role) {
        // Bagong account: ipakita muna ang pagpipilian ng role
        setPendingName(res.data.name || '');
        setPendingCredential(response.credential);
      } else {
        finishLogin(res.data);
      }
    } catch (err) {
      setGoogleError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Hindi natapos ang pag-sign in gamit ang Google.'
      );
    } finally {
      setLoading(false);
    }
  }

  /** Tinatawag pagkapili ng Buyer o Farmer para sa bagong Gmail account. */
  async function chooseGoogleRole(role) {
    setGoogleError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/google', {
        credential: pendingCredential,
        role,
      });
      setPendingCredential(null);
      finishLogin(res.data);
    } catch (err) {
      setGoogleError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Hindi natapos ang paggawa ng account.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !googleBtnRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          // Susunod sa lapad ng container, pero hindi lalampas sa 360px
          width: Math.min(360, Math.max(200, googleBtnRef.current.offsetWidth)),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setGoogleError('Hindi ma-load ang Google sign-in. Subukang muli.');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="landing login-page">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
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

            {GOOGLE_CLIENT_ID && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '18px 0',
                    color: '#888',
                    fontSize: 13,
                  }}
                >
                  <span style={{ flex: 1, height: 1, background: '#ddd' }} />
                  o
                  <span style={{ flex: 1, height: 1, background: '#ddd' }} />
                </div>

                <div
                  ref={googleBtnRef}
                  style={{
                    display: pendingCredential ? 'none' : 'flex',
                    justifyContent: 'center',
                    minHeight: 44,
                  }}
                />

                {pendingCredential && (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.08)',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ margin: '0 0 12px', fontWeight: 600 }}>
                      Welcome{pendingName ? `, ${pendingName}` : ''}! Ano ang account mo?
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        className="lp-btn lp-btn-primary"
                        style={{ flex: 1 }}
                        disabled={loading}
                        onClick={() => chooseGoogleRole('buyer')}
                      >
                        Buyer
                      </button>
                      <button
                        type="button"
                        className="lp-btn lp-btn-primary"
                        style={{ flex: 1 }}
                        disabled={loading}
                        onClick={() => chooseGoogleRole('farmer')}
                      >
                        Farmer
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingCredential(null);
                        setGoogleError('');
                      }}
                      style={{
                        marginTop: 10,
                        background: 'none',
                        border: 'none',
                        color: '#aaa',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Kanselahin
                    </button>
                  </div>
                )}

                {googleError && <div className="login-error" role="alert">{googleError}</div>}
              </>
            )}

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