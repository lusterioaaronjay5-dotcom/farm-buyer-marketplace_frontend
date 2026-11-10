import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { findSameProducts } from '../priceCompare';
import './ProductPriceCompare.css';

function DiffBadge({ pct }) {
  if (pct === 0) return <span className="badge">Parehong presyo</span>;
  if (pct < 0) return <span className="badge badge-success">Mas mura ng {Math.abs(pct)}%</span>;
  return <span className="badge badge-danger">Mas mahal ng {pct}%</span>;
}

export default function ProductPriceCompare({ product, products }) {
  const basePrice = Number(product.price);
  const offers = useMemo(() => findSameProducts(product, products), [product, products]);

  return (
    <section className="ppc">
      <div className="ppc-head">
        <h2>Price Compare</h2>
        <span className="ppc-sub">Parehong produkto at unit sa ibang farmer</span>
      </div>

      {offers.length <= 1 ? (
        <p className="ppc-muted">
          Wala pang ibang farmer na nagbebenta ng produktong ito na may parehong unit.
        </p>
      ) : (
        <ul className="ppc-list">
          {offers.map((o, i) => {
            const price = Number(o.price);
            const isCurrent = String(o.product_id) === String(product.product_id);
            const soldOut = !(o.quantity_available > 0);
            const isBest = i === 0 && !soldOut;
            const pct =
              basePrice > 0 ? Math.round(((price - basePrice) / basePrice) * 100) : 0;

            return (
              <li key={o.product_id} className={`ppc-row${isBest ? ' is-best' : ''}`}>
                <div className="ppc-info">
                  <strong>{o.farmer_name}</strong>
                  <span className="ppc-meta">
                    {o.location} · {soldOut ? 'Ubos na' : `In stock: ${o.quantity_available}`}
                  </span>
                </div>

                <div className="ppc-price">
                  <span className="ppc-amount">
                    ₱{price.toFixed(2)} / {o.unit}
                  </span>
                  {isBest && <span className="badge badge-accent">Pinakamura</span>}
                  {isCurrent ? (
                    <span className="badge">Kasalukuyan</span>
                  ) : (
                    <DiffBadge pct={pct} />
                  )}
                </div>

                {!isCurrent && !soldOut ? (
                  <Link className="btn btn-primary ppc-go" to={`/product?id=${o.product_id}`}>
                    Tingnan
                  </Link>
                ) : (
                  <span />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}