import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import FarmerLayout from '../components/FarmerLayout';
import SalesSummary from '../components/SalesSummary';
import StockPie from '../components/StockPie';
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

function FarmerDashboard({ user }) {
  const { data, loading, error } = useApiData('farmer:dashboard', '/farmer/dashboard');

  const firstName = (user.full_name || '').split(' ')[0] || 'Farmer';

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

                          <Link to="/farmer/orders" className="fd-view">View details</Link>
                        </div>
                      );
                    })
                  )}
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <section className="card fd-panel fd-rise" style={{ animationDelay: '330ms' }}>
                    <div className="fd-panel-head">
                      <h2>Ubos na ang Stock</h2>
                      <Link to="/farmer/products">Pamahalaan</Link>
                    </div>

                    {data.low_stock.length === 0 ? (
                      <p className="fd-empty">Maayos pa ang stock ng lahat ng produkto.</p>
                    ) : (
                      data.low_stock.map((p) => (
                        <Link to="/farmer/products" className="fd-low" key={p.product_id}>
                          <strong>{p.product_name}</strong>
                          <span className="fd-stock">
                            {p.quantity_available} {p.unit}
                          </span>
                        </Link>
                      ))
                    )}
                  </section>

                  <section className="card fd-panel fd-rise" style={{ animationDelay: '410ms' }}>
                    <div className="fd-panel-head">
                      <h2>Stock ng Produkto</h2>
                      <Link to="/farmer/products">Pamahalaan</Link>
                    </div>
                    <StockPie items={data.stock_breakdown || []} />
                  </section>
                </div>
              </div>
            </>
          )
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