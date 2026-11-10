import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';
import FarmerLayout from '../components/FarmerLayout';
import DeliveryMap from '../components/DeliveryMap';
import useApiData from '../useApiData';
import { invalidate } from '../dataCache';
import './ReceivedOrders.css';

const STATUS_LABELS = {
  pending: 'Hindi pa bayad',
  confirmed: 'Kumpirmado',
  preparing: 'Inihahanda',
  out_for_delivery: 'Nasa delivery',
  completed: 'Tapos na',
  cancelled: 'Kinansela',
};

const PAYMENT_LABELS = {
  paid: 'Bayad na',
  unpaid: 'Hindi pa bayad',
  failed: 'Pumalya',
};

const STEPS = ['confirmed', 'preparing', 'out_for_delivery', 'completed'];

const ACTION_LABELS = {
  preparing: 'Simulan ihanda',
  out_for_delivery: 'Ipadala na',
  completed: 'Markahan na tapos',
};

// Mga tab. Galing sa totoong status ng backend.
const TABS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'pending', label: 'Pending', match: (s) => s === 'pending' },
  {
    key: 'active',
    label: 'Active',
    match: (s) => ['confirmed', 'preparing', 'out_for_delivery'].includes(s),
  },
  { key: 'completed', label: 'Completed', match: (s) => s === 'completed' },
  { key: 'cancelled', label: 'Cancelled', match: (s) => s === 'cancelled' },
];

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
  if (isNaN(d)) return value;
  return d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

function actionHint(order) {
  if (order.status === 'pending') return 'Naghihintay ng bayad mula sa buyer.';
  if (order.status === 'cancelled') return 'Kinansela ang order na ito.';
  if (order.status === 'completed') return 'Tapos na ang order na ito.';
  return '';
}

export default function ReceivedOrders() {
  const token = localStorage.getItem('token');
  const storedUser = getStoredUser();

  // Cache-first: kapag may laman na ang cache, agad lalabas ang listahan
  const { data, loading, error: loadError, reload } = useApiData('farmer:orders', '/farmer/orders');

  const [tab, setTab] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const orders = data?.orders || [];
  const currentTab = TABS.find((t) => t.key === tab) || TABS[0];
  const visible = orders.filter((o) => currentTab.match(o.status));
  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = orders.filter((o) => t.match(o.status)).length;
    return acc;
  }, {});

  // Kung walang napili, ang unang order sa tab ang ipapakita
  const activeId = selectedId ?? visible[0]?.order_id ?? null;
  const selected = orders.find((o) => o.order_id === activeId) || null;
  const shownError = error || loadError;

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  if (storedUser.role !== 'farmer') {
    return <Navigate to="/marketplace" replace />;
  }

  function changeTab(key) {
    setTab(key);
    setSelectedId(null);
    setMessage('');
    setError('');
  }

  function selectOrder(id) {
    setSelectedId(id);
    setMessage('');
    setError('');
  }

  async function advance(order) {
    if (!order.next_status) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/farmer/orders/status', {
        order_id: order.order_id,
        status: order.next_status,
      });
      setMessage(res.data.message || 'Na-update ang status.');
      // Burahin ang lumang cache at kumuha ng bagong data
      invalidate('farmer:orders', 'farmer:dashboard');
      reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Hindi na-update ang status.');
    } finally {
      setBusy(false);
    }
  }

  const delivery = selected?.delivery || null;
  const hasCoords =
    delivery && delivery.latitude !== null && delivery.longitude !== null;

  return (
    <FarmerLayout>
      <div className="ro-page">
        <header className="ro-header">
          <p className="ro-eyebrow">Farmer</p>
          <h1>Received Orders</h1>
          <p className="ro-sub">
            Mga order na may produkto mo. I-update ang status habang inihahanda at ipinapadala ang order.
          </p>
        </header>

        {shownError && <p className="ro-error">{shownError}</p>}
        {message && <p className="ro-ok">{message}</p>}

        {loading ? (
          <p className="ro-empty">Naglo-load...</p>
        ) : orders.length === 0 ? (
          <p className="ro-empty">Wala ka pang natatanggap na order.</p>
        ) : (
          <>
            <div className="ro-tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  className={`ro-tab${tab === t.key ? ' is-active' : ''}`}
                  onClick={() => changeTab(t.key)}
                >
                  {t.label}
                  <span className="ro-tab-count">{counts[t.key]}</span>
                </button>
              ))}
            </div>

            <div className="ro-layout">
              <aside className="ro-list">
                {visible.length === 0 ? (
                  <p className="ro-list-empty">Walang order sa tab na ito.</p>
                ) : (
                  visible.map((o) => (
                    <button
                      key={o.order_id}
                      type="button"
                      className={`ro-card-item${o.order_id === activeId ? ' is-active' : ''}`}
                      onClick={() => selectOrder(o.order_id)}
                    >
                      <div className="ro-card-top">
                        <strong>Order #{o.order_id}</strong>
                        <span className={`badge ${badgeClass(o.status)}`}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </div>
                      <span className="ro-card-meta">
                        {o.buyer?.full_name || 'Buyer'} · {formatDate(o.created_at)}
                      </span>
                      <span className="ro-card-total">{peso(o.subtotal)}</span>
                    </button>
                  ))
                )}
              </aside>

              {selected && (
                <section className="card ro-detail">
                  <div className="ro-detail-head">
                    <div>
                      <p className="ro-eyebrow">Order Details</p>
                      <h2>Order #{selected.order_id}</h2>
                      <p className="ro-sub">{formatDate(selected.created_at)}</p>
                    </div>
                    <span className={`badge ${badgeClass(selected.status)}`}>
                      {STATUS_LABELS[selected.status] || selected.status}
                    </span>
                  </div>

                  {selected.status !== 'cancelled' && (
                    <div className="ro-block">
                      <h3>Progreso</h3>
                      <div className="ro-steps">
                        {STEPS.map((step, i) => {
                          const current = STEPS.indexOf(selected.status);
                          const done = current >= i;
                          return (
                            <div key={step} className={`ro-step${done ? ' done' : ''}`}>
                              <span className="ro-dot">{done ? '✓' : i + 1}</span>
                              <span>{STATUS_LABELS[step]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="ro-block">
                    <h3>Mga Produkto Mo</h3>
                    {selected.items.map((item) => (
                      <div className="ro-item-row" key={item.product_id}>
                        <span>
                          {item.product_name}{' '}
                          <small>× {item.quantity} {item.unit}</small>
                        </span>
                        <span>{peso(item.line_total)}</span>
                      </div>
                    ))}
                    <div className="ro-total-row">
                      <span>Kabuuan mo</span>
                      <strong>{peso(selected.subtotal)}</strong>
                    </div>
                  </div>

                  <div className="ro-two-col">
                    <div className="ro-block">
                      <h3>Buyer</h3>
                      <p>{selected.buyer?.full_name || '—'}</p>
                      <p className="ro-muted">{selected.buyer?.phone || 'Walang phone'}</p>

                      <h3>Bayad</h3>
                      {selected.payment ? (
                        <>
                          <span className={`badge ${badgeClass(selected.payment.status)}`}>
                            {PAYMENT_LABELS[selected.payment.status] || selected.payment.status}
                          </span>
                          <p className="ro-muted">Ref: {selected.payment.reference || '—'}</p>
                        </>
                      ) : (
                        <p className="ro-muted">Wala pang bayad</p>
                      )}
                    </div>

                    <div className="ro-block">
                      <h3>Delivery Address</h3>
                      <p>{delivery?.address || 'Walang address'}</p>
                    </div>
                  </div>

                  {hasCoords && (
                    <div className="ro-block">
                      <h3>Delivery Map</h3>
                      <DeliveryMap
                        lat={Number(delivery.latitude)}
                        lng={Number(delivery.longitude)}
                        label={`Order #${selected.order_id}`}
                        status={selected.status}
                        route={{
                          originLat: delivery.origin_latitude,
                          originLng: delivery.origin_longitude,
                          dispatchedAt: delivery.dispatched_at,
                        }}
                      />
                    </div>
                  )}

                  <div className="ro-actions">
                    {selected.next_status ? (
                      <button
                        type="button"
                        className="btn btn-primary ro-action"
                        disabled={busy}
                        onClick={() => advance(selected)}
                      >
                        {busy ? 'Sine-save...' : ACTION_LABELS[selected.next_status]}
                      </button>
                    ) : (
                      <span className="ro-muted">{actionHint(selected)}</span>
                    )}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </FarmerLayout>
  );
}