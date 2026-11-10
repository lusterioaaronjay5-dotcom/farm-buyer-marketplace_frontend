import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import BuyerLayout from '../components/BuyerLayout';
import FarmerModal from '../components/FarmerModal';
import ProductPriceCompare from '../components/ProductPriceCompare';
import { addToCart } from '../cart';
import useApiData from '../useApiData';
import './ProductDetail.css';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function peso(value) {
  return `₱${Number(value || 0).toFixed(2)}`;
}

export default function ProductDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const user = getStoredUser();
  const isBuyer = user?.role === 'buyer';
  const homePath = isBuyer ? '/buyer/dashboard' : '/';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [added, setAdded] = useState(false);
  const [showFarmer, setShowFarmer] = useState(false);

  // Lahat ng products, gagamitin para sa "More Products You May Like" at Price Compare
  const { data: allData } = useApiData('buyer:products', '/products');
  const allProducts = Array.isArray(allData) ? allData : allData?.products || [];

  useEffect(() => {
    setQuantity(1);
    setMessage('');
    setAdded(false);
    setShowFarmer(false);

    if (!id) {
      setError('Walang produktong napili.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    api
      .get('/products/detail', { params: { id } })
      .then((res) => setProduct(res.data.product || res.data))
      .catch(() => setError('Hindi mahanap ang produkto.'))
      .finally(() => setLoading(false));
  }, [id]);

  const stock = Number(product?.quantity_available) || 0;

  // ID ng farmer para sa popup. Kung wala sa product, hahanapin sa listahan ng products.
  const farmerId = useMemo(() => {
    if (!product) return null;
    if (product.farmer_id != null) return product.farmer_id;
    const match = allProducts.find((p) => p.farmer_name === product.farmer_name);
    return match?.farmer_id ?? null;
  }, [product, allProducts]);

  // Ibang products lang ng PAREHONG farmer. Hindi kasama ang kasalukuyang produkto.
  const related = useMemo(() => {
    if (!product) return [];

    const isSameFarmer = (p) =>
      product.farmer_id != null && p.farmer_id != null
        ? String(p.farmer_id) === String(product.farmer_id)
        : p.farmer_name === product.farmer_name;

    return allProducts
      .filter((p) => String(p.product_id) !== String(product.product_id))
      .filter(isSameFarmer)
      .slice(0, 4);
  }, [allProducts, product]);

  function changeQuantity(value) {
    const n = Number(value) || 1;
    setQuantity(Math.max(1, Math.min(stock || 1, n)));
  }

  function handleAdd() {
    setAdded(false);
    setMessage('');

    if (!user) {
      setMessage('Mag-login muna bilang buyer para makapag-add to cart.');
      return;
    }
    if (!isBuyer) {
      setMessage('Buyer account lang ang puwedeng mag-add to cart.');
      return;
    }

    addToCart(product, Math.min(quantity, stock));
    setAdded(true);
    setMessage(`Naidagdag sa cart: ${quantity} ${product.unit}.`);
  }

  const body = (
    <div className="pd-root">
      <nav className="pd-crumbs" aria-label="Breadcrumb">
        <Link to={homePath}>Home</Link>
        <span className="pd-sep">/</span>
        <Link to="/marketplace">Marketplace</Link>
        <span className="pd-sep">/</span>
        <span className="pd-current">{product?.product_name || 'Produkto'}</span>
      </nav>

      {loading && <p className="pd-muted">Naglo-load...</p>}
      {error && <p className="pd-error">{error}</p>}

      {product && (
        <>
          <section className="pd-main">
            <div className="pd-media">
              {product.image_path ? (
                <img src={product.image_path} alt={product.product_name} />
              ) : (
                <div className="pd-placeholder">No image</div>
              )}
            </div>

            <div className="pd-info">
              <span className="pd-cat">{product.category}</span>
              <h1>{product.product_name}</h1>
              <p className="pd-price">
                {peso(product.price)} <span>/ {product.unit}</span>
              </p>
              <span className={`pd-stock ${stock > 0 ? 'is-in' : 'is-out'}`}>
                {stock > 0 ? `In stock: ${stock}` : 'Sold out'}
              </span>

              {product.description && <p className="pd-desc">{product.description}</p>}

              <div className="pd-actions">
                <label className="pd-qty">
                  <span>Quantity</span>
                  <input
                    type="number"
                    min="1"
                    max={stock || 1}
                    value={quantity}
                    disabled={stock === 0}
                    onChange={(e) => changeQuantity(e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="pd-add"
                  onClick={handleAdd}
                  disabled={stock === 0}
                >
                  {stock === 0 ? 'Sold out' : 'Idagdag sa Cart'}
                </button>
              </div>

              <Link to="/marketplace" className="pd-back">
                ← Bumalik sa Marketplace
              </Link>

              {message && (
                <p className={added ? 'pd-success' : 'pd-warn'}>
                  {message}{' '}
                  {added && <Link to="/cart">Pumunta sa Cart</Link>}
                </p>
              )}
            </div>
          </section>

          <ProductPriceCompare product={product} products={allProducts} />

          <button
            type="button"
            className="pd-farmer"
            onClick={() => setShowFarmer(true)}
            disabled={farmerId == null}
          >
            <span className="pd-farmer-avatar">
              {(product.farmer_name || 'F').charAt(0).toUpperCase()}
            </span>
            <span>
              <span className="pd-label">Farmer</span>
              <span className="pd-farmer-name">{product.farmer_name || 'Hindi nakalista'}</span>
              <span className="pd-meta">{product.location || 'Hindi nakalista ang lokasyon'}</span>
            </span>
            <span className="pd-farmer-cta">Tingnan ang detalye ›</span>
          </button>

          {related.length > 0 && (
            <section className="pd-related">
              <h2>More Products You May Like</h2>
              <div className="pd-related-grid">
                {related.map((p) => (
                  <article key={p.product_id} className="pd-rel-card">
                    <div className="pd-rel-img">
                      {p.image_path ? (
                        <img src={p.image_path} alt={p.product_name} />
                      ) : (
                        <span>No image</span>
                      )}
                    </div>
                    <div className="pd-rel-body">
                      <h3>{p.product_name}</h3>
                      <p className="pd-meta">{p.farmer_name}</p>
                      <p className="pd-rel-price">
                        {peso(p.price)} <span>/ {p.unit}</span>
                      </p>
                      <Link to={`/product?id=${p.product_id}`} className="pd-rel-btn">
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {showFarmer && (
            <FarmerModal
              farmerId={farmerId}
              me={user?.user_id ?? user?.id}
              onClose={() => setShowFarmer(false)}
            />
          )}
        </>
      )}
    </div>
  );

  if (isBuyer) {
    return <BuyerLayout>{body}</BuyerLayout>;
  }

  return (
    <div className="pd-guest">
      <Navbar />
      {body}
    </div>
  );
}