import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <header className="nav">
        <nav className="nav-links">
          <Link to="/" className="active">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/login">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </nav>
      </header>

      <section className="hero">
        <h1>
          Fresh Produce, <br />
          <span>Direct from Farmers</span>
        </h1>
        <p>
          Connect directly with local farmers and buy fresh, affordable
          produce without middlemen.
        </p>
        <div className="hero-buttons">
          <Link to="/marketplace" className="btn-primary">Explore Marketplace →</Link>
          <Link to="/register" className="btn-outline">Join FarmConnect</Link>
        </div>
      </section>

      <section className="features">
        <div className="card">
          <h3>Direct Access</h3>
          <p>Buy straight from farmers in your area.</p>
        </div>
        <div className="card">
          <h3>Fair Prices</h3>
          <p>Farmers set their own prices with no middlemen.</p>
        </div>
        <div className="card">
          <h3>Easy Delivery</h3>
          <p>Track your order from preparation to your door.</p>
        </div>
      </section>

      <footer className="footer">
        © 2026 FarmConnect · Supporting local agriculture.
      </footer>
    </div>
  );
}