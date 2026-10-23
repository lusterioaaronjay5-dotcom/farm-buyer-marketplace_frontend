import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Home.css';
import './Login.css';
import './FarmerProducts.css';

const emptyForm = {
  product_name: '',
  category: '',
  unit: '',
  price: '',
  quantity_available: '',
  availability: 'available',
  location: '',
  description: '',
};

function getError(err, fallback) {
  return err.response?.data?.error || err.response?.data?.message || fallback;
}

export default function FarmerProducts() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');

    if (!token || !saved) {
      navigate('/login');
      return;
    }

    const parsed = JSON.parse(saved);
    if (parsed.role !== 'farmer') {
      navigate('/marketplace');
      return;
    }

    setUser(parsed);
    loadProducts();
  }, [navigate]);

  async function loadProducts() {
    setLoading(true);
    setPageError('');
    try {
      const res = await api.get('/farmer/products');
      setProducts(res.data.products || []);
    } catch (err) {
      setPageError(getError(err, 'Hindi ma-load ang produkto mo.'));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setNotice('');
    setFormOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.product_id);
    setForm({
      product_name: p.product_name,
      category: p.category,
      unit: p.unit,
      price: String(p.price),
      quantity_available: String(p.quantity_available),
      availability: p.availability,
      location: p.location || '',
      description: p.description || '',
    });
    setFormError('');
    setNotice('');
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFormError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      if (editingId) {
        await api.post('/farmer/products/update', { ...form, product_id: editingId });
        setNotice('Na-update ang produkto.');
      } else {
        await api.post('/farmer/products', form);
        setNotice('Naidagdag ang produkto.');
      }
      closeForm();
      await loadProducts();
    } catch (err) {
      setFormError(getError(err, 'Hindi na-save ang produkto.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Burahin ang "${p.product_name}"?`)) return;

    setNotice('');
    setPageError('');
    try {
      await api.post('/farmer/products/delete', { product_id: p.product_id });
      setNotice('Nabura ang produkto.');
      await loadProducts();
    } catch (err) {
      setPageError(getError(err, 'Hindi nabura ang produkto.'));
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className="farmer-page">
      <section className="farmer-banner">
        <header className="nav">
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/farmer/products" className="active">My Products</Link>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>

        <div className="farmer-hero-text">
          <h1>
            Welcome, <span>{user.full_name}</span>
          </h1>
          <p>Farmer Dashboard</p>
        </div>
      </section>

      <main className="farmer-card">
        <div className="farmer-toolbar">
          <div>
            <h2>My Products</h2>
            <p>Pamahalaan ang mga produktong ibinebenta mo.</p>
          </div>
          {!formOpen && (
            <button type="button" className="btn-primary farmer-add" onClick={openAdd}>
              + Add Product
            </button>
          )}
        </div>

        {notice && <div className="farmer-notice">{notice}</div>}
        {pageError && <div className="farmer-error">{pageError}</div>}

        {formOpen && (
          <form className="farmer-form" onSubmit={handleSave}>
            <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>

            {formError && <div className="farmer-error">{formError}</div>}

            <div className="farmer-grid">
              <div className="form-group">
                <label htmlFor="product_name">Product name *</label>
                <input
                  id="product_name"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  placeholder="Fresh Tomatoes"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <input
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Vegetables"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="60.00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit *</label>
                <input
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  placeholder="kg, bundle, piece"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity_available">Quantity available *</label>
                <input
                  id="quantity_available"
                  name="quantity_available"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity_available}
                  onChange={handleChange}
                  placeholder="50"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="availability">Availability *</label>
                <select
                  id="availability"
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Socorro, Oriental Mindoro"
                />
              </div>

              <div className="form-group full">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Maikling detalye ng produkto"
                />
              </div>
            </div>

            <div className="farmer-form-actions">
              <button type="button" className="btn-outline" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="farmer-empty">Loading produkto...</p>
        ) : products.length === 0 ? (
          <p className="farmer-empty">Wala ka pang produkto. Pindutin ang + Add Product.</p>
        ) : (
          <div className="table-wrap">
            <table className="farmer-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.product_id}>
                    <td>{p.product_name}</td>
                    <td>{p.category}</td>
                    <td>₱{Number(p.price).toFixed(2)} / {p.unit}</td>
                    <td>{p.quantity_available}</td>
                    <td>
                      <span className={p.availability === 'available' ? 'status in' : 'status out'}>
                        {p.availability}
                      </span>
                    </td>
                    <td className="actions">
                      <button type="button" className="btn-small-outline" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="btn-small-danger" onClick={() => handleDelete(p)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="footer">
        © 2026 FarmConnect · Supporting local agriculture.
      </footer>
    </div>
  );
}