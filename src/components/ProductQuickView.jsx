import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { findSameProducts } from '../priceCompare';
import './ProductQuickView.css';

function DiffBadge({ pct }) {
  if (pct === 0) return <span className="badge">Parehong presyo</span>;
  if (pct < 0) return <span className="badge badge-success">Mas mura ng {Math.abs(pct)}%</span>;
  return <span className="badge badge-danger">Mas mahal ng {pct}%</span>;
}

export default function ProductQuickView({ product, products, onClose }) {
  const [comparing, setComparing] = useState(false);

  const basePrice = Number(product.price);
  const offers = useMemo(() => findSameProducts(product, products), [product, products]);

  // Isara sa Escape key at i-lock ang scroll ng page habang bukas ang popup
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="pqv-backdrop" onClick={onClose}>
      <div
        className="pqv-modal"
        role="dialog"
        aria-modal="true"
        aria-label={product.product_name}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="pqv-close" onClick={onClose} aria-label="Isara">
          ×
        </button>

        <span className="badge badge-accent">{product.category}</span>
        <h2>{product.product_name}</h2>
        <p className="pqv-meta">
          {product.farmer_name} · {product.location}
        </p>
        <p className="pqv-price">
          ₱{basePrice.toFixed(2)} <span>/ {product.unit}</span>
        </p>
        <p className="pqv-meta">In stock: {product.quantity_available}</p>

        {!comparing ? (
          <button
            type="button"
            className="btn btn-primary pqv-cta"
            onClick={() => setComparing(true)}
          >
            Price Compare
          </button>
        ) : (
          <section className="pqv-compare">
            <h3>Ihambing ang presyo</h3>

            {offers.length <= 1 && (
              <p className="pqv-muted">
                Wala pang ibang farmer na nagbebenta ng produktong ito na may parehong unit.
              </p>
            )}

            <ul className="pqv-list">
              {offers.map((o, i) => {
                const price = Number(o.price);
                const isCurrent = o.product_id === product.product_id;
                const soldOut = !(o.quantity_available > 0);
                const isBest = i === 0 && !soldOut && offers.length > 1;
                const pct =
                  basePrice > 0 ? Math.round(((price - basePrice) / basePrice) * 100) : 0;

                return (
                  <li key={o.product_id} className={`pqv-row${isBest ? ' is-best' : ''}`}>
                    <div className="pqv-row-info">
                      <strong>{o.farmer_name}</strong>
                      <span className="pqv-muted">
                        {o.location} · {soldOut ? 'Ubos na' : `In stock: ${o.quantity_available}`}
                      </span>
                    </div>

                    <div className="pqv-row-price">
                      <span className="pqv-amount">
                        ₱{price.toFixed(2)} / {o.unit}
                      </span>
                      {isBest && <span className="badge badge-accent">Pinakamura</span>}
                      {isCurrent ? (
                        <span className="badge">Kasalukuyan</span>
                      ) : (
                        <DiffBadge pct={pct} />
                      )}
                    </div>

                    {!isCurrent && !soldOut && (
                      <Link
                        className="btn btn-primary pqv-go"
                        to={`/product?id=${o.product_id}`}
                        onClick={onClose}
                      >
                        Pumunta sa produkto
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}