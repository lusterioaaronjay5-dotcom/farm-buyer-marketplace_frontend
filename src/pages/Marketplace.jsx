import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BuyerLayout from '../components/BuyerLayout';
import ProductQuickView from '../components/ProductQuickView';
import { CATEGORIES, LOCATIONS } from '../constants';
import useApiData from '../useApiData';
import { buildPriceBenchmarks, comparePrice } from '../priceCompare';
import './Marketplace.css';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function PriceBadge({ result, unit }) {
  if (result.status === 'none') {
    return <p className="mp-compare mp-muted">Walang sapat na ihahambing pa</p>;
  }

  if (result.status === 'cheaper') {
    return (
      <p className="mp-compare">
        <span className="badge badge-success">Mas mura ng {result.pct}%</span>
        <span className="mp-muted">kaysa average na ₱{result.avg.toFixed(2)} / {unit}</span>
      </p>
    );
  }

  if (result.status === 'pricier') {
    return (
      <p className="mp-compare">
        <span className="badge badge-danger">Mas mahal ng {result.pct}%</span>
        <span className="mp-muted">kaysa average na ₱{result.avg.toFixed(2)} / {unit}</span>
      </p>
    );
  }

  return (
    <p className="mp-compare">
      <span className="badge">Pasok sa karaniwang presyo</span>
      <span className="mp-muted">average na ₱{result.avg.toFixed(2)} / {unit}</span>
    </p>
  );
}

export default function Marketplace() {
  const user = getStoredUser();
  const isBuyer = user?.role === 'buyer';

  // Cache-first: agad lalabas ang produkto kapag bumalik sa page
  const { data, loading, error: loadError } = useApiData('buyer:products', '/products');
  const products = Array.isArray(data) ? data : data?.products || [];
  const error = loadError ? 'Hindi ma-load ang mga produkto.' : '';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [selected, setSelected] = useState(null);

  const closeQuickView = useCallback(() => setSelected(null), []);

  const benchmarks = useMemo(() => buildPriceBenchmarks(products), [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        [p.product_name, p.farmer_name, p.category].some((v) =>
          (v || '').toLowerCase().includes(q)
        );
      const matchCategory = !category || p.category === category;
      // Naglalaman ang location ng produkto ng probinsya, halimbawa "Socorro, Oriental Mindoro"
      const matchLocation = !loc || (p.location || '').toLowerCase().includes(loc);
      return matchSearch && matchCategory && matchLocation;
    });
  }, [products, search, category, location]);

  function clearFilters() {
    setSearch('');
    setCategory('');
    setLocation('');
  }

  const content = (
    <div className="mp-page">
      <section className="mp-hero">
        <h1>
          <strong>Fresh Products</strong> from Local Farmers
        </h1>
        <p>Hanapin ang produktong kailangan mo at direktang bumili sa farmer.</p>

        <input
          className="mp-search"
          placeholder="Search produkto, farmer, o category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="mp-filters">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All Locations</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <button type="button" className="btn btn-ghost" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </section>

      <section className="mp-body">
        <p className="mp-count">{filtered.length} produkto ang nahanap</p>

        {loading && <p className="mp-muted">Naglo-load...</p>}
        {error && <p className="mp-error">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="mp-muted">Walang produktong nahanap.</p>
        )}

        <div className="mp-grid">
          {filtered.map((p) => (
            <article className="card mp-card" key={p.product_id}>
              <div
                className="mp-open"
                role="button"
                tabIndex={0}
                onClick={() => setSelected(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(p);
                  }
                }}
              >
                <div className="mp-img">
                  {p.image_path ? (
                    <img
                      src={p.image_path}
                      alt={p.product_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    'No image'
                  )}
                </div>

                <div className="mp-info">
                  <span className="badge badge-accent mp-cat">{p.category}</span>
                  <h3>{p.product_name}</h3>
                  <p className="mp-meta">
                    {p.farmer_name} · {p.location}
                  </p>
                  <p className="mp-price">
                    ₱{Number(p.price).toFixed(2)} <span>/ {p.unit}</span>
                  </p>
                  <PriceBadge result={comparePrice(p, benchmarks)} unit={p.unit} />
                </div>
              </div>

              <div className="mp-foot">
                <span
                  className={`badge ${p.quantity_available > 0 ? 'badge-success' : 'badge-danger'}`}
                >
                  In stock: {p.quantity_available}
                </span>
                <Link className="btn btn-primary mp-btn" to={`/product?id=${p.product_id}`}>
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected && (
        <ProductQuickView product={selected} products={products} onClose={closeQuickView} />
      )}
    </div>
  );

  if (isBuyer) {
    return <BuyerLayout>{content}</BuyerLayout>;
  }

  return (
    <div className="mp-guest">
      <Navbar />
      {content}
    </div>
  );
}