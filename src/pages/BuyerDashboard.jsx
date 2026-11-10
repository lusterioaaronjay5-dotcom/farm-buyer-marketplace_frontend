import { Link, Navigate } from 'react-router-dom';
import BuyerLayout from '../components/BuyerLayout';
import useApiData from '../useApiData';
import './BuyerDashboard.css';

const STATUS_LABELS = {
  pending: 'Hindi pa bayad',
  confirmed: 'Kumpirmado',
  preparing: 'Inihahanda',
  out_for_delivery: 'Nasa delivery',
  completed: 'Tapos na',
  cancelled: 'Kinansela',
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

function peso(value) {
  return '₱' + Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  if (isNaN(d)) return value;
  return d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

function statusTone(s) {
  if (s === 'completed') return 'ok';
  if (s === 'cancelled') return 'bad';
  if (s === 'pending') return 'warn';
  return 'info';
}

export default function BuyerDashboard() {
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  // Gumagamit ng parehong cache key ng Marketplace at My Orders, kaya walang dagdag na request
  const productsState = useApiData('buyer:products', '/products');
  const ordersState = useApiData('buyer:orders', '/orders');

  const productList = Array.isArray(productsState.data)
    ? productsState.data
    : productsState.data?.products || [];
  const orderList = ordersState.data?.orders || [];

  const availableProducts = productList.filter((p) => Number(p.quantity_available) > 0);
  const featured = availableProducts.slice(0, 4);
  const recent = orderList.slice(0, 5);

  const stats = [
    { label: 'Available Products', value: availableProducts.length },
    { label: 'Total Orders', value: orderList.length },
    { label: 'Pending Orders', value: orderList.filter((o) => o.status === 'pending').length },
    { label: 'Completed Orders', value: orderList.filter((o) => o.status === 'completed').length },
  ];

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'buyer') {
    return <Navigate to="/marketplace" replace />;
  }

  const loading = productsState.loading || ordersState.loading;
  const hasError = productsState.error || ordersState.error;
  const firstName = (user.full_name || '').trim().split(/\s+/)[0] || 'Buyer';

  return (
    <BuyerLayout>
      <div className="bd-page">
        <section className="bd-welcome">
          <div>
            <h1>Welcome back, {firstName}!</h1>
            <p>Discover fresh agricultural products and stay updated with your orders.</p>
          </div>
          <Link to="/marketplace" className="bd-cta">Browse Marketplace</Link>
        </section>

        {hasError && (
          <p className="bd-error">Hindi ma-load ang dashboard. Subukan ulit.</p>
        )}

        <section className="bd-stats">
          {stats.map((s) => (
            <div className="bd-stat" key={s.label}>
              <span className="bd-stat-label">{s.label}</span>
              <strong className="bd-stat-value">{loading ? '—' : s.value}</strong>
            </div>
          ))}
        </section>

        <section className="bd-block">
          <div className="bd-block-head">
            <h2>Featured Agricultural Products</h2>
            <Link to="/marketplace">View all</Link>
          </div>

          {loading ? (
            <p className="bd-muted">Naglo-load...</p>
          ) : featured.length === 0 ? (
            <p className="bd-muted">Walang available na produkto ngayon.</p>
          ) : (
            <div className="bd-products">
              {featured.map((p) => (
                <article className="bd-product" key={p.product_id}>
                  <div className="bd-product-img">
                    {p.image_path ? (
                      <img src={p.image_path} alt={p.product_name} />
                    ) : (
                      <span>No image</span>
                    )}
                  </div>

                  <div className="bd-product-body">
                    <span className="bd-chip">{p.category}</span>
                    <h3>{p.product_name}</h3>
                    <p className="bd-product-meta">
                      {p.farmer_name} · {p.location}
                    </p>
                    <p className="bd-price">
                      {peso(p.price)} <span>/ {p.unit}</span>
                    </p>
                    <p className="bd-product-meta">Available: {p.quantity_available}</p>
                  </div>

                  <Link className="bd-view" to={`/product?id=${p.product_id}`}>
                    View Product
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="bd-block">
          <div className="bd-block-head">
            <h2>Recent Orders</h2>
            <Link to="/my-orders">View all</Link>
          </div>

          {loading ? (
            <p className="bd-muted">Naglo-load...</p>
          ) : recent.length === 0 ? (
            <p className="bd-muted">Wala ka pang order.</p>
          ) : (
            <div className="bd-table-wrap">
              <table className="bd-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => {
                    const items = o.items || [];
                    const first = items[0];
                    const qty = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
                    return (
                      <tr key={o.order_id}>
                        <td>#{String(o.order_id).padStart(4, '0')}</td>
                        <td>
                          {first ? first.product_name : '—'}
                          {items.length > 1 && (
                            <span className="bd-muted"> +{items.length - 1} pa</span>
                          )}
                        </td>
                        <td>{qty}</td>
                        <td>{formatDate(o.order_date)}</td>
                        <td>{peso(o.total_amount)}</td>
                        <td>
                          <span className={`bd-status is-${statusTone(o.status)}`}>
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </BuyerLayout>
  );
}