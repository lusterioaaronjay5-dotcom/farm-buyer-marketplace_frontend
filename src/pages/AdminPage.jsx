import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const ROLES = ['buyer', 'farmer', 'admin'];

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  };
}

async function adminRequest(path, options = {}) {
  const res = await fetch(`/api/admin${path}`, { ...options, headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'May error. Subukan ulit.');
  return data;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

const styles = {
  tabs: { display: 'flex', gap: 8, marginBottom: 16 },
  tab: (active) => ({
    padding: '8px 16px',
    border: '1px solid #cbd5e0',
    borderRadius: 6,
    background: active ? '#2f855a' : '#fff',
    color: active ? '#fff' : '#2d3748',
    cursor: 'pointer',
  }),
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#1a202c' },
  th: { textAlign: 'left', padding: 10, borderBottom: '2px solid #e2e8f0', fontSize: 14, color: '#1a202c' },
  td: { padding: 10, borderBottom: '1px solid #edf2f7', fontSize: 14, verticalAlign: 'middle', color: '#1a202c' },
  msg: { padding: 10, marginBottom: 12, background: '#f0fff4', borderRadius: 6, color: '#22543d' },
  err: { padding: 10, marginBottom: 12, background: '#fff5f5', borderRadius: 6, color: '#9b2c2c' },
  btn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: 6,
    background: '#2f855a',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default function AdminPage() {
  const navigate = useNavigate();
  const me = getStoredUser();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function loadUsers() {
    const data = await adminRequest('/users');
    setUsers(data.users || []);
  }

  async function loadProducts() {
    const data = await adminRequest('/products');
    setProducts(data.products || []);
  }

  useEffect(() => {
    if (!me || me.role !== 'admin') {
      navigate('/');
      return;
    }
    loadUsers().catch((e) => setErr(e.message));
    loadProducts().catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeRole(userId, role) {
    setMsg('');
    setErr('');
    try {
      await adminRequest('/user-role', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, role }),
      });
      setMsg('Na-update ang role.');
      await loadUsers();
    } catch (e) {
      setErr(e.message);
      await loadUsers();
    }
  }

  async function toggleProduct(product) {
    const next = product.availability === 'available' ? 'unavailable' : 'available';
    setMsg('');
    setErr('');
    try {
      await adminRequest('/product-availability', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.product_id, availability: next }),
      });
      setMsg(next === 'unavailable' ? 'Na-disable ang product.' : 'Na-enable ang product.');
      await loadProducts();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <AdminLayout>
      <h2 style={{ marginTop: 0 }}>Admin Panel</h2>

      <div style={styles.tabs}>
        <button type="button" style={styles.tab(tab === 'users')} onClick={() => setTab('users')}>
          Users ({users.length})
        </button>
        <button type="button" style={styles.tab(tab === 'products')} onClick={() => setTab('products')}>
          Products ({products.length})
        </button>
      </div>

      {msg && <div style={styles.msg}>{msg}</div>}
      {err && <div style={styles.err}>{err}</div>}

      {tab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Pangalan</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td style={styles.td}>{u.user_id}</td>
                  <td style={styles.td}>{u.full_name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <select
                      value={u.role}
                      disabled={Number(u.user_id) === Number(me?.user_id)}
                      onChange={(e) => changeRole(u.user_id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'products' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Produkto</th>
                <th style={styles.th}>Farmer</th>
                <th style={styles.th}>Presyo</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksyon</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id}>
                  <td style={styles.td}>{p.product_id}</td>
                  <td style={styles.td}>{p.product_name}</td>
                  <td style={styles.td}>{p.farmer_name || '—'}</td>
                  <td style={styles.td}>₱{Number(p.price).toFixed(2)}</td>
                  <td style={styles.td}>{p.availability}</td>
                  <td style={styles.td}>
                    <button type="button" style={styles.btn} onClick={() => toggleProduct(p)}>
                      {p.availability === 'available' ? 'I-disable' : 'I-enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}