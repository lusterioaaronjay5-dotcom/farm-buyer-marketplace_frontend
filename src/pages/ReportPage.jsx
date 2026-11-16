import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import FarmerLayout from '../components/FarmerLayout';
import BuyerLayout from '../components/BuyerLayout';

const ENDPOINTS = {
  admin: '/reports/admin',
  farmer: '/reports/farmer',
  buyer: '/reports/buyer',
};

const LAYOUTS = {
  admin: AdminLayout,
  farmer: FarmerLayout,
  buyer: BuyerLayout,
};

const TITLES = {
  admin: 'Admin Report',
  farmer: 'Farmer Sales Report',
  buyer: 'Buyer Order Report',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PAGE_SIZE = 10;

// Inline CSS para sa report at sa print. Sa print, PDF lang ang nakikita.
const PRINT_CSS = `
  .rp-controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; margin-bottom: 16px; }
  .rp-controls label { display: flex; flex-direction: column; font-size: 13px; gap: 4px; }
  .rp-btn { padding: 8px 14px; border: none; border-radius: 6px; background: #2f855a; color: #fff; cursor: pointer; }
  .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .rp-btn-ghost { padding: 8px 14px; border: 1px solid #cbd5e0; border-radius: 6px; background: #fff; cursor: pointer; }
  .rp-box { background: #fff; color: #1a202c; border-radius: 12px; padding: 20px; }
  .rp-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 12px 0; }
  .rp-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; background: #fff; }
  .rp-card span { font-size: 12px; color: #4a5568; }
  .rp-card strong { display: block; font-size: 18px; margin-top: 4px; }
  .rp-section { font-size: 15px; margin: 18px 0 4px; }
  .rp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .rp-table th, .rp-table td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; color: #1a202c; }
  .rp-table th { background: #f7faf4; }
  .rp-off { display: none; }
  .rp-pager { display: flex; align-items: center; gap: 10px; margin: 10px 0 4px; font-size: 13px; }
  .rp-pager button { padding: 6px 12px; border: 1px solid #cbd5e0; border-radius: 6px; background: #fff; cursor: pointer; }
  .rp-pager button:disabled { opacity: 0.4; cursor: not-allowed; }
  @media print {
    body * { visibility: hidden; }
    .rp-print, .rp-print * { visibility: visible; }
    .rp-print { position: absolute; left: 0; top: 0; width: 100%; padding: 0; box-shadow: none; }
    .no-print { display: none !important; }
    .rp-off { display: table-row !important; }
  }
`;

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

function peso(value) {
  return '₱' + Number(value || 0).toFixed(2);
}

function shortDate(value) {
  return String(value || '').slice(0, 10);
}

function statusLabel(s) {
  return STATUS_LABELS[s] || s;
}

function Cards({ items }) {
  return (
    <div className="rp-cards">
      {items.map(([label, value]) => (
        <div className="rp-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

// Sa screen, 10 rows lang ang nakikita kada pahina.
// Sa print, lahat ng rows ang lalabas (ang nakatagong rows ay may class na rp-off).
function Table({ headers, rows, empty }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="rp-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length}>{empty}</td>
              </tr>
            ) : (
              rows.map((cells, i) => (
                <tr key={i} className={i >= start && i < end ? undefined : 'rp-off'}>
                  {cells.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > PAGE_SIZE && (
        <div className="rp-pager no-print">
          <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Nakaraan
          </button>
          <span>
            Pahina {page} ng {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Susunod
          </button>
        </div>
      )}
    </>
  );
}

function AdminReport({ data }) {
  const s = data.summary;
  return (
    <>
      <Cards
        items={[
          ['Buyers', s.users.buyer],
          ['Farmers', s.users.farmer],
          ['Admins', s.users.admin],
          ['Produkto (available / lahat)', `${s.products_available} / ${s.products_total}`],
          ['Kabuuang order', s.orders_total],
          ['Sales (completed)', peso(s.sales_completed)],
          ['Delivery fees', peso(s.delivery_fees)],
        ]}
      />
      <h3 className="rp-section">Talaan ng Order</h3>
      <Table
        headers={['Order', 'Petsa', 'Buyer', 'Status', 'Paraan', 'Delivery fee', 'Total']}
        empty="Walang order sa napiling petsa."
        rows={data.orders.map((o) => [
          `#${o.order_id}`,
          shortDate(o.order_date),
          o.buyer_name,
          statusLabel(o.status),
          o.delivery_method === 'pickup' ? 'Pickup' : 'Delivery',
          peso(o.delivery_fee),
          peso(o.total_amount),
        ])}
      />
    </>
  );
}

function FarmerReport({ data }) {
  const s = data.summary;
  return (
    <>
      <Cards
        items={[
          ['Produkto', s.products_total],
          ['Kabuuang order', s.orders_total],
          ['Sales (completed)', peso(s.sales_completed)],
          ['Completed na order', s.orders_by_status.completed || 0],
        ]}
      />
      <h3 className="rp-section">Benta Kada Produkto</h3>
      <Table
        headers={['Produkto', 'Nabenta', 'Kita', 'Rating']}
        empty="Walang produkto."
        rows={data.products.map((p) => [
          p.product_name,
          p.quantity_sold,
          peso(p.revenue),
          p.rating_avg ? `${p.rating_avg} (${p.rating_count})` : '—',
        ])}
      />
      <h3 className="rp-section">Talaan ng Order</h3>
      <Table
        headers={['Order', 'Petsa', 'Buyer', 'Status', 'Paraan', 'Subtotal mo']}
        empty="Walang order sa napiling petsa."
        rows={data.orders.map((o) => [
          `#${o.order_id}`,
          shortDate(o.order_date),
          o.buyer_name,
          statusLabel(o.status),
          o.delivery_method === 'pickup' ? 'Pickup' : 'Delivery',
          peso(o.subtotal),
        ])}
      />
    </>
  );
}

function BuyerReport({ data }) {
  const s = data.summary;
  return (
    <>
      <Cards
        items={[
          ['Kabuuang order', s.orders_total],
          ['Completed na order', s.orders_by_status.completed || 0],
          ['Kabuuang ginastos', peso(s.total_spent)],
          ['Delivery fees', peso(s.delivery_fees)],
        ]}
      />
      <h3 className="rp-section">Talaan ng Order</h3>
      <Table
        headers={['Order', 'Petsa', 'Status', 'Paraan', 'Delivery fee', 'Total']}
        empty="Walang order sa napiling petsa."
        rows={data.orders.map((o) => [
          `#${o.order_id}`,
          shortDate(o.order_date),
          statusLabel(o.status),
          o.delivery_method === 'pickup' ? 'Pickup' : 'Delivery',
          peso(o.delivery_fee),
          peso(o.total_amount),
        ])}
      />
    </>
  );
}

export default function ReportPage() {
  const user = getStoredUser();
  const role = user?.role;

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!role || !ENDPOINTS[role]) return undefined;

    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get(ENDPOINTS[role], { params: { from, to } })
      .then((res) => {
        if (!cancelled) setReport(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              'Hindi na-load ang report.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role, from, to]);

  if (!role || !ENDPOINTS[role]) {
    return <Navigate to="/login" replace />;
  }

  const Layout = LAYOUTS[role];

  return (
    <Layout>
      <style>{PRINT_CSS}</style>

      <div className="rp-controls no-print">
        <label>
          Mula
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          Hanggang
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <button
          type="button"
          className="rp-btn-ghost"
          onClick={() => {
            setFrom('');
            setTo('');
          }}
        >
          Lahat ng petsa
        </button>
        <button
          type="button"
          className="rp-btn"
          onClick={() => window.print()}
          disabled={!report}
        >
          I-print / I-save bilang PDF
        </button>
      </div>

      {error && <p className="no-print" style={{ color: '#9b2c2c' }}>{error}</p>}
      {loading && <p className="no-print">Naglo-load...</p>}

      {report && (
        <div className="rp-print rp-box">
          <h2 style={{ margin: '0 0 4px' }}>{TITLES[role]}</h2>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#4a5568' }}>
            {user.full_name} · Petsa: {report.from || 'Lahat'} hanggang {report.to || 'ngayon'} ·
            Nalikha: {new Date().toLocaleString('en-PH')}
          </p>

          {role === 'admin' && <AdminReport data={report} />}
          {role === 'farmer' && <FarmerReport data={report} />}
          {role === 'buyer' && <BuyerReport data={report} />}
        </div>
      )}
    </Layout>
  );
}