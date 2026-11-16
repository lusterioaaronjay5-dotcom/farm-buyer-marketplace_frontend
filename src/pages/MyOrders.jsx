import { useEffect, useState } from 'react';
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

function Stars({ value }) {
  return (
    <span style={{ color: '#d69e2e', letterSpacing: 2 }}>
      {'★'.repeat(value)}
      {'☆'.repeat(5 - value)}
    </span>
  );
}

// Rating at feedback para sa bawat produkto ng completed na order
function ReviewSection({ order }) {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    api
      .get('/reviews/order', { params: { order_id: order.order_id } })
      .then((res) => {
        if (!cancelled) setReviews(res.data.reviews || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [order.order_id]);

  const reviewed = new Map(reviews.map((r) => [r.product_id, r]));

  function updateDraft(productId, patch) {
    setDrafts((d) => ({
      ...d,
      [productId]: { rating: 0, comment: '', ...d[productId], ...patch },
    }));
  }

  async function submit(productId) {
    const draft = drafts[productId] || { rating: 0, comment: '' };
    if (!draft.rating) {
      setErrors((e) => ({ ...e, [productId]: 'Pumili muna ng bilang ng bituin.' }));
      return;
    }

    setSavingId(productId);
    setErrors((e) => ({ ...e, [productId]: '' }));
    try {
      await api.post('/reviews', {
        order_id: order.order_id,
        product_id: productId,
        rating: draft.rating,
        comment: draft.comment,
      });
      setReviews((prev) => [
        ...prev,
        { product_id: productId, rating: draft.rating, comment: draft.comment },
      ]);
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [productId]: err.response?.data?.error || 'Hindi na-save ang rating.',
      }));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="card mo-block">
      <h3 className="mo-block-title">Rating at Feedback</h3>

      {!loaded && <p className="mo-muted">Naglo-load...</p>}

      {loaded &&
        order.items.map((item) => {
          const done = reviewed.get(item.product_id);
          const draft = drafts[item.product_id] || { rating: 0, comment: '' };

          return (
            <div
              key={item.order_item_id}
              style={{ padding: '12px 0', borderBottom: '1px solid #edf2f7' }}
            >
              <strong>{item.product_name}</strong>

              {done ? (
                <div style={{ marginTop: 6 }}>
                  <Stars value={done.rating} />
                  {done.comment && <p className="mo-muted">{done.comment}</p>}
                </div>
              ) : (
                <div style={{ marginTop: 6 }}>
                  <div>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} bituin`}
                        onClick={() => updateDraft(item.product_id, { rating: n })}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 22,
                          cursor: 'pointer',
                          color: '#d69e2e',
                          padding: 0,
                          marginRight: 4,
                        }}
                      >
                        {n <= draft.rating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    maxLength={1000}
                    placeholder="Feedback (opsyonal)"
                    value={draft.comment}
                    onChange={(e) => updateDraft(item.product_id, { comment: e.target.value })}
                    style={{ width: '100%', marginTop: 6, padding: 8, boxSizing: 'border-box' }}
                  />

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={savingId === item.product_id}
                    onClick={() => submit(item.product_id)}
                    style={{ marginTop: 6 }}
                  >
                    {savingId === item.product_id ? 'Sinasave...' : 'I-submit'}
                  </button>

                  {errors[item.product_id] && (
                    <p className="mo-error">{errors[item.product_id]}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
    </section>
  );
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

  // Sa pickup, "Handa na kunin" ang label ng ikaapat na step at walang map
  const isPickup = selected?.delivery_method === 'pickup';
  const steps = isPickup
    ? STEPS.map((s) => (s.key === 'out_for_delivery' ? { ...s, label: 'Handa na kunin' } : s))
    : STEPS;

  const currentIndex = selected
    ? steps.findIndex((s) => s.key === selected.status)
    : -1;
  const progress =
    currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0;
  const hasCoords =
    !isPickup && delivery && delivery.latitude != null && delivery.longitude != null;

  // Gumagawa ng Xendit invoice at diretsong dinadala ang buyer sa payment page
  async function handlePay() {
    setPayMsg('');
    setPaying(true);
    try {
      const res = await api.post('/orders/xendit-checkout', { order_id: selected.order_id });
      window.location.href = res.data.invoice_url;
    } catch (err) {
      setPayMsg(err.response?.data?.error || 'Hindi natuloy ang bayad.');
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
                        {steps.map((s, i) => (
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

                  {(() => {
                    const fee = Number(selected.delivery_fee || 0);
                    const sub = Number(selected.total_amount) - fee;
                    return (
                      <>
                        <div className="mo-total-row" style={{ fontWeight: 400 }}>
                          <span>Subtotal</span>
                          <span>₱{sub.toFixed(2)}</span>
                        </div>
                        <div className="mo-total-row" style={{ fontWeight: 400 }}>
                          <span>
                            {selected.delivery_method === 'pickup' ? 'Pickup (libre)' : 'Delivery fee'}
                          </span>
                          <span>₱{fee.toFixed(2)}</span>
                        </div>
                        <div className="mo-total-row">
                          <span>Total</span>
                          <strong>₱{Number(selected.total_amount).toFixed(2)}</strong>
                        </div>
                      </>
                    );
                  })()}
                </section>

                {selected.status === 'completed' && (
                  <ReviewSection key={selected.order_id} order={selected} />
                )}

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
                        {paying ? 'Pinoproseso...' : 'Bayaran sa Xendit'}
                      </button>
                    )}
                    {payMsg && <p className="mo-msg">{payMsg}</p>}
                  </div>

                  <div className="mo-mini">
                    <p className="mo-mini-label">
                      {selected.delivery_method === 'pickup' ? 'Pickup · Contact' : 'Delivery Address'}
                    </p>
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
                        etaSeconds: delivery.eta_seconds,
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