import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ChatBox from './ChatBox';
import './FarmerModal.css';

function peso(value) {
  return `₱${Number(value || 0).toFixed(2)}`;
}

export default function FarmerModal({ farmerId, me, onClose }) {
  const [view, setView] = useState('profile');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!farmerId) {
      setError('Hindi mahanap ang farmer.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    api
      .get('/farmers/detail', { params: { id: farmerId } })
      .then((res) => setData(res.data))
      .catch(() => setError('Hindi ma-load ang impormasyon ng farmer.'))
      .finally(() => setLoading(false));
  }, [farmerId]);

  // Isara sa Escape key at i-lock ang scroll ng page habang bukas ang popup
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const farmer = data?.farmer;
  const products = data?.products || [];
  const initial = (farmer?.full_name || 'F').charAt(0).toUpperCase();

  return (
    <div className="fm-backdrop" onClick={onClose}>
      <div
        className="fm-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="fm-hero">
          <button type="button" className="fm-x" onClick={onClose} aria-label="Isara">
            ✕
          </button>
          <div className="fm-avatar">{initial}</div>
          <div className="fm-hero-text">
            <span className="fm-kicker">Farmer</span>
            <h2>{farmer?.full_name || (loading ? 'Naglo-load...' : 'Farmer')}</h2>
            {farmer?.address && <span className="fm-place">📍 {farmer.address}</span>}
          </div>
        </header>

        <div className="fm-body">
          {loading && <p className="fm-muted">Naglo-load...</p>}
          {error && <p className="fm-error">{error}</p>}

          {farmer && view === 'profile' && (
            <>
              <div className="fm-cards">
                <div className="fm-card">
                  <span className="fm-card-label">Email</span>
                  <span className="fm-card-value">{farmer.email || '—'}</span>
                </div>
                <div className="fm-card">
                  <span className="fm-card-label">Contact Number</span>
                  <span className="fm-card-value">{farmer.phone || '—'}</span>
                </div>
              </div>

              <button
                type="button"
                className="fm-btn fm-btn-primary fm-btn-block"
                onClick={() => setView('chat')}
              >
                Message ang farmer
              </button>
              <button
                type="button"
                className="fm-btn fm-btn-ghost fm-btn-block"
                onClick={() => setView('products')}
              >
                Tingnan ang mga produkto ({products.length})
              </button>
            </>
          )}

          {farmer && view === 'products' && (
            <>
              <button type="button" className="fm-back" onClick={() => setView('profile')}>
                ← Balik
              </button>
              <h3 className="fm-section-title">Mga produkto ni {farmer.full_name}</h3>

              {products.length === 0 ? (
                <p className="fm-muted">Wala pang produktong nakalista.</p>
              ) : (
                <div className="fm-grid">
                  {products.map((p) => {
                    const inStock = p.availability === 'available' && p.quantity_available > 0;
                    return (
                      <article key={p.product_id} className="fm-prod">
                        <div className="fm-prod-img">
                          {p.image_path ? (
                            <img src={p.image_path} alt={p.product_name} />
                          ) : (
                            <span>No image</span>
                          )}
                        </div>
                        <div className="fm-prod-body">
                          <span className="fm-prod-cat">{p.category}</span>
                          <h4>{p.product_name}</h4>
                          <p className="fm-prod-price">
                            {peso(p.price)} <span>/ {p.unit}</span>
                          </p>
                          <span className={`fm-prod-stock ${inStock ? 'is-in' : 'is-out'}`}>
                            {inStock ? `In stock: ${p.quantity_available}` : 'Sold out'}
                          </span>
                        </div>
                        <Link
                          to={`/product?id=${p.product_id}`}
                          className="fm-prod-link"
                          onClick={onClose}
                        >
                          Tingnan ang produkto
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {farmer && view === 'chat' && (
            <>
              <button type="button" className="fm-back" onClick={() => setView('profile')}>
                ← Balik sa profile
              </button>
              <ChatBox withUserId={farmer.user_id} withName={farmer.full_name} me={me} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}