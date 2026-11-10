import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import BuyerLayout from '../components/BuyerLayout';
import LocationPicker from '../components/LocationPicker';
import { getCart, updateQuantity, removeFromCart, clearCart } from '../cart';
import { invalidate } from '../dataCache';
import './Cart.css';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCart());
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  function refresh() {
    setItems(getCart());
  }

  function changeQty(productId, qty) {
    updateQuantity(productId, Math.max(1, qty));
    refresh();
  }

  function remove(productId) {
    removeFromCart(productId);
    refresh();
  }

  async function handleCheckout() {
    setError('');

    const token = localStorage.getItem('token');
    const user = getStoredUser();

    if (!token || !user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      setError('Buyer account lang ang puwedeng mag-order.');
      return;
    }
    if (items.length === 0) {
      setError('Walang laman ang cart.');
      return;
    }
    if (!address.trim()) {
      setError('Ilagay ang delivery address.');
      return;
    }
    if (!pin) {
      setError('I-pin muna ang lokasyon ng delivery sa mapa.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
        delivery_address: address.trim(),
        notes: '',
        latitude: pin.lat,
        longitude: pin.lng,
      });

      clearCart();
      // Burahin ang lumang cache ng orders para lumabas agad ang bagong order
      invalidate('buyer:orders');
      setItems([]);
      setPin(null);
      setSuccess(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Hindi natuloy ang order. Subukan ulit.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <BuyerLayout>
      <h1 className="cart-title">Shopping Cart & Checkout</h1>

      {items.length === 0 ? (
        <div className="card cart-empty">
          Walang laman ang cart. <Link to="/marketplace">Mamili sa Marketplace</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="card cart-panel">
            <h2 className="panel-head">Cart Items</h2>

            <div className="cart-list">
              {items.map((item) => (
                <div className="cart-row" key={item.product_id}>
                  <div className="cart-thumb">IMAGE</div>

                  <div className="cart-info">
                    <strong>{item.product_name}</strong>
                    <span>{item.farmer_name}</span>
                    <button
                      type="button"
                      className="remove-link"
                      onClick={() => remove(item.product_id)}
                    >
                      Remove item
                    </button>
                  </div>

                  <div className="cart-qty">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        changeQty(item.product_id, Number(e.target.value) || 1)
                      }
                    />
                  </div>

                  <div className="cart-line-total">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="card summary-panel">
            <h2 className="panel-head">Order Summary</h2>

            <div className="summary-row">
              <span>Items subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery fee (if applicable)</span>
              <span>₱{deliveryFee.toFixed(2)}</span>
            </div>

            <div className="summary-total">
              <span>Total Amount</span>
              <strong>₱{total.toFixed(2)}</strong>
            </div>

            <label className="summary-label" htmlFor="address">
              Delivery address
            </label>
            <input
              id="address"
              className="summary-input"
              placeholder="Enter delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <p className="summary-label">Pin sa mapa (required)</p>
            <LocationPicker value={pin} onChange={setPin} />

            <div className="pin-row">
              {pin ? (
                <>
                  <span>
                    Naka-pin: {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost pin-clear"
                    onClick={() => setPin(null)}
                  >
                    Alisin ang pin
                  </button>
                </>
              ) : (
                <span className="pin-none">
                  Mag-pin muna sa mapa bago mag-checkout.
                </span>
              )}
            </div>

            <p className="payment-method">Payment method: E-wallet (simulated)</p>

            <button
              type="button"
              className="btn btn-primary checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Pinoproseso...' : 'Proceed to Checkout'}
            </button>
          </aside>
        </div>
      )}

      <section className="card payment-status">
        <h3>Payment Status / Confirmation</h3>

        {error && <p className="status-error">{error}</p>}

        {success && (
          <p className="status-ok">
            Na-place na ang order #{success.order_id}. Total: ₱
            {Number(success.total_amount).toFixed(2)}. Naghihintay ng bayad.
          </p>
        )}

        {!error && !success && (
          <p className="status-muted">
            A result message will appear after the payment is completed.
          </p>
        )}
      </section>
    </BuyerLayout>
  );
}