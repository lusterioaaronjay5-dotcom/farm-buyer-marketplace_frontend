import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Home.css';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate(res.data.user.role === 'farmer' ? '/farmer/products' : '/marketplace');
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
    <div className="login-page">
      <header className="nav">
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/login" className="active">Login</Link>
          <Link to="/register">Get Started</Link>
        </nav>
      </header>

      <main className="login-main">
        <div className="login-card">
          <h1>Welcome back</h1>
          <p className="login-sub">Mag-login para makabili o magbenta ng produkto.</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="login-foot">
            Wala pang account? <Link to="/register">Register dito</Link>
          </p>
        </div>
      </main>

      <footer className="footer">
        © 2026 FarmConnect · Supporting local agriculture.
      </footer>
    </div>
  );
}