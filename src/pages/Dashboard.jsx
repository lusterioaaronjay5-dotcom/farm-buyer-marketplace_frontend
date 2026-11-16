import { useCallback, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import FarmerLayout from '../components/FarmerLayout';
import SalesSummary from '../components/SalesSummary';
import useApiData from '../useApiData';
import './Dashboard.css';
import './DashboardMotion.css';

const STATUS_LABELS = {
  pending: 'Hindi pa bayad',
  confirmed: 'Kumpirmado',
  preparing: 'Inihahanda',
  out_for_delivery: 'Nasa delivery',
  completed: 'Tapos na',
  cancelled: 'Kinansela',
};

// Kulay ng badge ayon sa status (galing sa index.css)
function badgeClass(s) {
  switch (s) {
    case 'pending':
    case 'unpaid':
      return 'badge-warning';
    case 'confirmed':
    case 'preparing':
    case 'out_for_delivery':
      return 'badge-accent';
    case 'completed':
    case 'paid':
      return 'badge-success';
    case 'cancelled':
    case 'failed':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
}

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
  if (isNaN(d)) return String(value);
  return d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

// Mabilis na bumibilang mula 0 papunta sa numero
function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(target);
      return undefined;
    }

    const duration = 900;
    const startTime = performance.now();
    let frame;

    function tick(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

const SVG = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ICONS = {
  products: (
    <svg {...SVG}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  ),
  check: (
    <svg {...SVG}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  ),
  clock: (
    <svg {...SVG}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  done: (
    <svg {...SVG}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  sales: (
    <svg {...SVG}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 15V9h4a2 2 0 0 1 0 4H9" />
    </svg>
  ),
};

// Popup na nagpapakita lang ng mga produkto ng isang order
function OrderItemsModal({ order, loading, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const muted = { margin: 0, fontSize: 13, color: 'var(--bd-muted)' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(15, 28, 19, 0.5)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#ffffff',
          borderRadius: 18,
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '18px 22px',
            borderBottom: '1px solid var(--bd-line)',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--bd-muted)',
              }}
            >
              Mga Produkto
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--bd-ink)' }}>
              {order ? `Order #${order.order_id}` : 'Order'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Isara"
            style={{
              width: 34,
              height: 34,
              flex: '0 0 34px',
              border: 'none',
              borderRadius: '50%',
              background: 'var(--bd-soft)',
              color: 'var(--bd-forest)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '16px 22px 20px', overflowY: 'auto' }}>
          {!order ? (
            <p style={muted}>{loading ? 'Naglo-load...' : 'Hindi makita ang order.'}</p>
          ) : (
            <>
              <p style={{ ...muted, marginBottom: 12 }}>{formatDate(order.created_at)}</p>

              {(order.items || []).map((item, i) => (
                <div
                  key={item.product_id ?? i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid #eef2ea',
                    fontSize: 14,
                    color: 'var(--bd-ink)',
                  }}
                >
                  <span>
                    {item.product_name}{' '}
                    <small style={{ color: 'var(--bd-muted)' }}>
                      × {item.quantity} {item.unit}
                    </small>
                  </span>
                  <strong style={{ whiteSpace: 'nowrap' }}>{peso(item.line_total)}</strong>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 14,
                  fontSize: 14,
                  color: 'var(--bd-ink)',
                }}
              >
                <span>Kabuuan</span>
                <strong style={{ color: 'var(--bd-forest)', fontSize: 16 }}>
                  {peso(order.subtotal)}
                </strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FarmerDashboard({ user }) {
  const { data, loading, error } = useApiData('farmer:dashboard', '/farmer/dashboard');
  // Parehong cache key ng Received Orders page, para sa mga produkto ng bawat order
  const { data: ordersData, loading: ordersLoading } = useApiData('farmer:orders', '/farmer/orders');
  const [openOrderId, setOpenOrderId] = useState(null);
  const closeOrder = useCallback(() => setOpenOrderId(null), []);

  const firstName = (user.full_name || '').split(' ')[0] || 'Farmer';

  const orders = ordersData?.orders || [];
  const openOrder =
    openOrderId !== null ? orders.find((o) => o.order_id === openOrderId) || null : null;

  const stats = data
    ? [
        { label: 'Total Products', value: data.stats.total_listings, icon: ICONS.products, hint: 'Lahat ng listing mo' },
        { label: 'Active Listings', value: data.stats.available, icon: ICONS.check, hint: 'Available ngayon' },
        { label: 'Pending Orders', value: data.stats.pending_orders, icon: ICONS.clock, hint: 'Kailangang aksyunan' },
        { label: 'Completed Orders', value: data.stats.completed_orders, icon: ICONS.done, hint: 'Tapos na' },
        { label: 'Total Sales', value: peso(data.stats.total_sales), icon: ICONS.sales, hint: 'Mula sa completed orders' },
      ]
    : [];

  return (
    <FarmerLayout>
      <div className="fd-page">
        <header className="fd-welcome fd-rise">
          <div>
            <p className="fd-eyebrow">Overview</p>
            <h1>Welcome back, {firstName}!</h1>
            <p className="fd-sub">Here's an overview of your farm marketplace activity.</p>
          </div>
          <Link to="/farmer/products" className="btn btn-primary">Manage Products</Link>
        </header>

        {error && <p className="fd-error">{error}</p>}

        {loading && !data ? (
          <p className="fd-empty">Naglo-load...</p>
        ) : (
          data && (
            <>
              <div className="fd-stats">
                {stats.map((s, i) => (
                  <div
                    className="fd-stat fd-rise"
                    style={{ animationDelay: `${i * 70}ms` }}
                    key={s.label}
                  >
                    <div className="fd-stat-top">
                      <span className="fd-stat-label">{s.label}</span>
                      <span className="fd-stat-icon">{s.icon}</span>
                    </div>
                    <span className="fd-stat-value">
                      {typeof s.value === 'number' ? <CountUp value={s.value} /> : s.value}
                    </span>
                    <span className="fd-stat-hint">{s.hint}</span>
                  </div>
                ))}
              </div>

              <div className="fd-rise" style={{ animationDelay: '160ms' }}>
                <SalesSummary />
              </div>

              <div className="fd-grid">
                <section className="card fd-panel fd-rise" style={{ animationDelay: '250ms' }}>
                  <div className="fd-panel-head">
                    <h2>Recent Orders</h2>
                    <Link to="/farmer/orders">Tingnan lahat</Link>
                  </div>

                  {data.recent_orders.length === 0 ? (
                    <p className="fd-empty">Wala pang order.</p>
                  ) : (
                    data.recent_orders.map((o) => {
                      const date = formatDate(o.created_at);

                      return (
                        <div className="fd-row" key={o.order_id}>
                          <div className="fd-row-main">
                            <strong>Order #{o.order_id}</strong>
                            <span className="fd-meta">
                              {o.buyer_name || 'Buyer'}
                              {date && ` · ${date}`}
                            </span>
                          </div>

                          <div className="fd-row-end">
                            <span className={`badge ${badgeClass(o.status)}`}>
                              {STATUS_LABELS[o.status] || o.status}
                            </span>
                            <span className="fd-amount">{peso(o.subtotal)}</span>
                          </div>

                          <button
                            type="button"
                            className="fd-view"
                            onClick={() => setOpenOrderId(o.order_id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              font: 'inherit',
                            }}
                          >
                            View details
                          </button>
                        </div>
                      );
                    })
                  )}
                </section>
              </div>
            </>
          )
        )}

        {openOrderId !== null && (
          <OrderItemsModal
            order={openOrder}
            loading={ordersLoading}
            onClose={closeOrder}
          />
        )}
      </div>
    </FarmerLayout>
  );
}

export default function Dashboard() {
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'farmer') {
    return <Navigate to="/marketplace" replace />;
  }

  return <FarmerDashboard user={user} />;
}