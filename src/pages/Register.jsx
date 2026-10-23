import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Home.css';
import './Login.css';
import './Register.css';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

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
      navigate(res.data.user.role === 'farmer' ? '/farmer/products' : '/marketplace');
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
    <div className="login-page">
      <header className="nav">
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/login">Login</Link>
          <Link to="/register" className="active">Get Started</Link>
        </nav>
      </header>

      <main className="login-main">
        <div className="login-card">
          <h1>Create account</h1>
          <p className="login-sub">Sumali bilang farmer o buyer.</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ako ay</label>
              <div className="role-options">
                <label className={`role-option ${form.role === 'buyer' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={form.role === 'buyer'}
                    onChange={handleChange}
                  />
                  Buyer
                </label>
                <label className={`role-option ${form.role === 'farmer' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={form.role === 'farmer'}
                    onChange={handleChange}
                  />
                  Farmer
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="full_name">Full name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="register-form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="09xx xxx xxxx"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Barangay, Bayan"
                />
              </div>
            </div>

            <div className="register-form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirm password</label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Ulitin ang password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="login-foot">
            May account na? <Link to="/login">Login dito</Link>
          </p>
        </div>
      </main>

      <footer className="footer">
        © 2026 FarmConnect · Supporting local agriculture.
      </footer>
    </div>
  );
}