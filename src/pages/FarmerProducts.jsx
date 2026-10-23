import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import './FarmerProducts.css';

export default function FarmerProducts() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');

    if (!token || !saved) {
      navigate('/login');
      return;
    }

    const parsed = JSON.parse(saved);
    if (parsed.role !== 'farmer') {
      navigate('/marketplace');
      return;
    }

    setUser(parsed);
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className="farmer-page">
      <section className="farmer-banner">
        <header className="nav">
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/farmer/products" className="active">My Products</Link>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>

        <div className="farmer-hero-text">
          <h1>
            Welcome, <span>{user.full_name}</span>
          </h1>
          <p>Farmer Dashboard</p>
        </div>
      </section>

      <main className="farmer-card">
        <h2>My Products</h2>
        <p>
          Dito mo makikita at mamamahala ang mga produktong ibinebenta mo.
        </p>

        <div className="farmer-actions">
          <button type="button" className="btn-disabled" disabled>
            + Add Product (susunod na step)
          </button>
        </div>

        <p className="farmer-note">
          Susunod nating gagawin ang listahan ng produkto mo, pati ang add, edit, at delete.
        </p>
      </main>

      <footer className="footer">
        © 2026 FarmConnect · Supporting local agriculture.
      </footer>
    </div>
  );
}