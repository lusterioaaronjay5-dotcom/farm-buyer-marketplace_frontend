import { useState } from 'react';
import api from '../api';
import BuyerLayout from '../components/BuyerLayout';
import DeliveryMap from '../components/DeliveryMap';
import useApiData from '../useApiData';
import { invalidate } from '../dataCache';
import './MyOrders.css';

const STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'completed', label: 'Completed' },
];

function prettyStatus(s) {
  return (s || '').replace(/_/g, ' ');
}

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

function padId(id) {
  return String(id).padStart(4, '0');
}

function formatDate(d) {
  return String(d || '').slice(0, 10);
}

export default function MyOrders() {
  // Cache-first: agad lalabas ang mga order kapag bumalik sa page
  const { data, loading, error: loadError, reload } = useApiData('buyer:orders', '/orders');
  const orders = data?.orders || [];
  const error = loadError;

  const [selectedId, setSelectedId] = useState(null);
  const [payMsg, setPayMsg] = useState('');
  const [paying, setPaying] = useState(false);

  // Kung walang napili, ang unang order ang ipapakita
  const activeId = selectedId ?? orders[0]?.order_id ?? null;

  const selected = orders.find((o) => o.order_id === activeId) || null;
  const payment = selected?.payment || null;
  const delivery = selected?.delivery || null;
  const isPaid = payment?.payment_status === 'paid';
  const canPay = selected && selected.status === 'pending' && !isPaid;
  const currentIndex = selected
    ? STEPS.findIndex((s) => s.key === selected.status)
    : -1;
  const progress =
    currentIndex >= 0 ? (currentIndex / (STEPS.length - 1)) * 100 : 0;
  const hasCoords =
    delivery && delivery.latitude != null && delivery.longitude != null;

  async function handlePay() {
    setPayMsg('');
    setPaying(true);
    try {
      const res = await api.post('/orders/pay', { order_id: selected.order_id });
      setPayMsg(`Bayad na! Reference: ${res.data.transaction_reference}`);
      // Burahin ang lumang cache at kumuha ng bagong data
      invalidate('buyer:orders');
      reload();
    } catch (err) {
      setPayMsg(err.response?.data?.error || 'Hindi natuloy ang bayad.');
    } finally {
      setPaying(false);
    }
  }

  function selectOrder(id) {
    setSelectedId(id);
    setPayMsg('');
  }

  return (
    <BuyerLayout>
      <div className="mo-page">
        <header className="mo-header">
          <div>
            <h1 className="mo-title">My Orders</h1>
            <p className="mo-subtitle">Subaybayan ang mga order at delivery mo.</p>
          </div>
        </header>

        {loading && <p className="mo-muted">Naglo-load...</p>}
        {error && <p className="mo-error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="mo-empty">
            <p>Wala ka pang order.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="mo-layout">
            <aside className="mo-sidebar">
              <h2 className="mo-section-title">Mga Order</h2>

              <div className="mo-list">
                {orders.map((o) => (
                  <button
                    key={o.order_id}
                    type="button"
                    className={`mo-card-item ${o.order_id === activeId ? 'is-active' : ''}`}
                    onClick={() => selectOrder(o.order_id)}
                  >
                    <div className="mo-card-top">
                      <strong>Order #{padId(o.order_id)}</strong>
                      <span className={`badge ${badgeClass(o.status)}`}>
                        {prettyStatus(o.status)}
                      </span>
                    </div>
                    <div className="mo-card-meta">{formatDate(o.order_date)}</div>
                    <div className="mo-card-bottom">
                      <span className="mo-card-total">
                        ₱{Number(o.total_amount).toFixed(2)}
                      </span>
                      <span className="mo-view">Tingnan →</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {selected && (
              <main className="mo-detail">
                <div className="mo-detail-head">
                  <div>
                    <p className="mo-eyebrow">Order Details</p>
                    <h2 className="mo-detail-title">Order #{padId(selected.order_id)}</h2>
                    <p className="mo-meta">{formatDate(selected.order_date)}</p>
                  </div>
                  <span className={`badge ${badgeClass(selected.status)}`}>
                    {prettyStatus(selected.status)}
                  </span>
                </div>

                <section className="card mo-block">
                  <h3 className="mo-block-title">Order Status</h3>

                  {selected.status === 'cancelled' ? (
                    <p className="mo-cancelled">Kinansela ang order na ito.</p>
                  ) : (
                    <>
                      <div className="mo-progress">
                        <div className="mo-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <ol className="mo-steps">
                        {STEPS.map((s, i) => (
                          <li
                            key={s.key}
                            className={i <= currentIndex ? 'is-done' : ''}
                          >
                            <span className="mo-step-dot">
                              {i <= currentIndex ? '✓' : i + 1}
                            </span>
                            <small>{s.label}</small>
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                </section>

                <section className="card mo-block">
                  <h3 className="mo-block-title">Mga Produkto</h3>

                  <ul className="mo-items">
                    {selected.items.map((i) => (
                      <li key={i.order_item_id} className="mo-item-row">
                        <div>
                          <strong>{i.product_name}</strong>
                          <span className="mo-item-qty">
                            {i.quantity} × ₱{Number(i.unit_price).toFixed(2)}
                          </span>
                        </div>
                        <span className="mo-item-sub">
                          ₱{Number(i.subtotal).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mo-total-row">
                    <span>Total</span>
                    <strong>₱{Number(selected.total_amount).toFixed(2)}</strong>
                  </div>
                </section>

                <section className="card mo-block mo-two-col">
                  <div className="mo-mini">
                    <p className="mo-mini-label">Bayad</p>
                    <span
                      className={`badge ${badgeClass(payment ? payment.payment_status : 'unpaid')}`}
                    >
                      {payment ? prettyStatus(payment.payment_status) : 'Unpaid'}
                    </span>
                    {payment?.transaction_reference && (
                      <p className="mo-ref">{payment.transaction_reference}</p>
                    )}

                    {canPay && (
                      <button
                        type="button"
                        className="btn btn-primary mo-pay"
                        onClick={handlePay}
                        disabled={paying}
                      >
                        {paying ? 'Pinoproseso...' : 'Bayaran (E-wallet simulated)'}
                      </button>
                    )}
                    {payMsg && <p className="mo-msg">{payMsg}</p>}
                  </div>

                  <div className="mo-mini">
                    <p className="mo-mini-label">Delivery Address</p>
                    <p className="mo-address">{selected.delivery_address}</p>
                  </div>
                </section>

                {hasCoords && (
                  <section className="card mo-block">
                    <h3 className="mo-block-title">Delivery Map</h3>
                    <DeliveryMap
                      key={selected.order_id}
                      lat={Number(delivery.latitude)}
                      lng={Number(delivery.longitude)}
                      label={`Order #${padId(selected.order_id)} · ${selected.delivery_address}`}
                      status={selected.status}
                      route={{
                        originLat: delivery.origin_latitude,
                        originLng: delivery.origin_longitude,
                        dispatchedAt: delivery.dispatched_at,
                      }}
                    />
                  </section>
                )}
              </main>
            )}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}