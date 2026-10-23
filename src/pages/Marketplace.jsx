import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Home.css';
import './Marketplace.css';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    api
      .get('/products')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.products || [];
        setProducts(list);
      })
      .catch(() => setError('Hindi ma-load ang mga produkto.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const locations = useMemo(
    () => [...new Set(products.map((p) => p.location).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        [p.product_name, p.farmer_name, p.category].some((v) =>
          (v || '').toLowerCase().includes(q)
        );
      const matchCategory = !category || p.category === category;
      const matchLocation = !location || p.location === location;
      return matchSearch && matchCategory && matchLocation;
    });
  }, [products, search, category, location]);

  function clearFilters() {
    setSearch('');
    setCategory('');
    setLocation('');
  }

  return (
    <div className="market-page">
      <section className="market-banner">
        <header className="nav">
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/marketplace" className="active">Marketplace</Link>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </nav>
        </header>

        <div className="market-hero-text">
          <h1>
            Fresh Products <span>from Local Farmers</span>
          </h1>
          <p>Hanapin ang produktong kailangan mo at direktang bumili sa farmer.</p>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search produkto, farmer, o category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <button type="button" className="btn-outline" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>
      </section>

      <main className="market-content">
        {loading && <p className="market-status">Loading produkto...</p>}
        {error && <p className="market-status error">{error}</p>}

        {!loading && !error && (
          <p className="market-count">{filtered.length} produkto ang nahanap</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="market-status">Walang produktong tumugma sa hanap mo.</p>
        )}

        <div className="product-grid">
          {filtered.map((p) => {
            const inStock =
              p.availability === 'available' && Number(p.quantity_available) > 0;

            return (
              <article className="product-card" key={p.product_id}>
                <div
                  className="product-img"
                  style={p.image_path ? { backgroundImage: `url(${p.image_path})` } : undefined}
                >
                  {!p.image_path && <span>No image</span>}
                </div>

                <div className="product-body">
                  <span className="product-category">{p.category}</span>
                  <h3>{p.product_name}</h3>
                  <p className="product-farmer">
                    {p.farmer_name} · {p.location}
                  </p>

                  <div className="product-footer">
                    <div className="product-price">
                      ₱{Number(p.price).toFixed(2)}
                      <span> / {p.unit}</span>
                    </div>

                    <div className="product-meta">
                      <span className={inStock ? 'stock in' : 'stock out'}>
                        {inStock ? `In stock: ${p.quantity_available}` : 'Unavailable'}
                      </span>
                      <Link
                        to={`/product?id=${p.product_id}`}
                        className="btn-primary btn-small"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <footer className="footer">
        © 2026 FarmConnect · Supporting local agriculture.
      </footer>
    </div>
  );
}