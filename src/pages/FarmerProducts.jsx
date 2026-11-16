import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import FarmerLayout, { StatCard } from '../components/FarmerLayout';
import { CATEGORIES } from '../constants';
import useApiData from '../useApiData';
import { invalidate } from '../dataCache';
import './FarmerProducts.css';
import './FarmerProductsModal.css';

const UNITS = ['kg', 'bundle', 'pcs', 'tray'];
const PAGE_SIZE = 10;

const emptyForm = {
  product_name: '',
  category: '',
  price: '',
  unit: '',
  quantity_available: '',
  availability: 'available',
  location: '',
  description: '',
  image_path: '',
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// Idinadagdag ang kasalukuyang value kung wala sa listahan (halimbawa lumang data)
function withCurrent(list, value) {
  return value && !list.includes(value) ? [value, ...list] : list;
}

// Ini-resize ang larawan sa browser para maliit ang laki, at ibinabalik bilang JPEG text
function resizeImage(file, maxSize = 600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Hindi mabasa ang larawan.'));
    };

    img.src = url;
  });
}

export default function FarmerProducts() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  const {
    data,
    loading,
    error: loadError,
    reload,
  } = useApiData('farmer:products', '/farmer/products');

  const products = data?.products || [];
  const initialLoading = loading && !data;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token || !user || user.role !== 'farmer') {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kapag bukas ang modal: i-lock ang scroll ng page at isara sa Escape
  useEffect(() => {
    if (!showForm) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e) {
      if (e.key === 'Escape') closeForm();
    }
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  // Pagkatapos ng save o delete: burahin ang lumang cache at i-refresh ang listahan
  function refreshAfterChange() {
    invalidate('farmer:products', 'farmer:dashboard');
    reload();
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function openEdit(p) {
    setEditingId(p.product_id);
    setForm({
      product_name: p.product_name,
      category: p.category,
      price: p.price,
      unit: p.unit,
      quantity_available: p.quantity_available,
      availability: p.availability,
      location: p.location || '',
      description: p.description || '',
      image_path: p.image_path || '',
    });
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('JPG, PNG, o WEBP lang ang puwede.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Masyadong malaki ang larawan. Pumili ng mas maliit.');
      return;
    }

    setError('');
    setProcessing(true);
    try {
      const dataUrl = await resizeImage(file);
      if (dataUrl.length > 500000) {
        setError('Masyadong malaki pa rin ang larawan. Pumili ng mas maliit.');
      } else {
        setForm((f) => ({ ...f, image_path: dataUrl }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingId) {
        await api.post('/farmer/products/update', { product_id: editingId, ...form });
      } else {
        await api.post('/farmer/products', form);
      }
      closeForm();
      refreshAfterChange();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Hindi na-save ang produkto.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Sigurado ka bang buburahin ang produktong ito?')) return;

    setError('');
    try {
      await api.post('/farmer/products/delete', { product_id: id });
      refreshAfterChange();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Hindi na-delete ang produkto.'
      );
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchText =
        !q ||
        [p.product_name, p.category, p.location].some((v) =>
          (v || '').toLowerCase().includes(q)
        );
      const matchCategory = !categoryFilter || p.category === categoryFilter;

      return matchText && matchCategory;
    });
  }, [products, search, categoryFilter]);

  const visibleRows = filtered.slice(0, visibleCount);

  const availableCount = products.filter((p) => p.availability === 'available').length;

  if (!token || !user || user.role !== 'farmer') return null;

  const shownError = error || loadError;

  return (
    <FarmerLayout>
      <h1 className="page-title">My Products</h1>

      <div className="stat-row">
        <StatCard label="Total Listings" value={products.length} />
        <StatCard label="Available" value={availableCount} />
        <StatCard label="Pending Orders" value="—" />
      </div>

      <div className="toolbar">
        <h2>Product Listings</h2>

        <div className="filter-row">
          <input
            type="text"
            className="filter-input"
            placeholder="Search your products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <option value="">Lahat ng category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button type="button" className="btn btn-primary" onClick={openAdd}>
            + Add Product
          </button>
        </div>
      </div>

      {!showForm && shownError && <div className="farmer-error">{shownError}</div>}

      {showForm && (
        <div
          className="fp-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div
            className="fp-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fp-modal-title"
          >
            <div className="fp-modal-head">
              <h3 id="fp-modal-title">
                {editingId ? 'I-edit ang produkto' : 'Bagong produkto'}
              </h3>
              <button
                type="button"
                className="fp-modal-close"
                onClick={closeForm}
                aria-label="Isara"
              >
                ×
              </button>
            </div>

            {error && <div className="farmer-error">{error}</div>}

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="span-2" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  {form.image_path ? (
                    <img
                      src={form.image_path}
                      alt="Preview ng produkto"
                      style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 10,
                        background: '#eef3ea',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#6b7a6b',
                        fontSize: 13,
                      }}
                    >
                      Walang larawan
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label className="btn btn-ghost" style={{ cursor: processing ? 'wait' : 'pointer' }}>
                      {processing
                        ? 'Pinoproseso...'
                        : form.image_path
                          ? 'Palitan ang larawan'
                          : 'Pumili ng larawan'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        disabled={processing}
                        hidden
                      />
                    </label>

                    {form.image_path && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setForm({ ...form, image_path: '' })}
                        disabled={processing}
                      >
                        Alisin
                      </button>
                    )}
                  </div>
                </div>

                <input
                  name="product_name"
                  placeholder="Pangalan ng produkto *"
                  value={form.product_name}
                  onChange={handleChange}
                  required
                />

                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="" disabled>Pumili ng category *</option>
                  {withCurrent(CATEGORIES, form.category).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Presyo *"
                  value={form.price}
                  onChange={handleChange}
                  required
                />

                <select name="unit" value={form.unit} onChange={handleChange} required>
                  <option value="" disabled>Pumili ng unit *</option>
                  {withCurrent(UNITS, form.unit).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <input
                  name="quantity_available"
                  type="number"
                  min="0"
                  placeholder="Stock *"
                  value={form.quantity_available}
                  onChange={handleChange}
                  required
                />

                <select name="availability" value={form.availability} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>

                <textarea
                  name="description"
                  className="span-2"
                  placeholder="Paglalarawan"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || processing}>
                  {saving ? 'Sinasave...' : 'I-save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialLoading && (
              <tr>
                <td colSpan="6" className="empty-cell">Naglo-load...</td>
              </tr>
            )}

            {!initialLoading && filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-cell">
                  Walang produktong tumugma. Pindutin ang + Add Product.
                </td>
              </tr>
            )}

            {!initialLoading &&
              visibleRows.map((p) => (
                <tr key={p.product_id}>
                  <td>
                    {p.image_path ? (
                      <img
                        src={p.image_path}
                        alt={p.product_name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{p.product_name}</td>
                  <td>₱{Number(p.price).toFixed(2)} / {p.unit}</td>
                  <td>{p.quantity_available} {p.unit}</td>
                  <td>
                    <span
                      className={`badge ${p.availability === 'available' ? 'badge-success' : 'badge-danger'}`}
                    >
                      {p.availability === 'available' ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button type="button" className="btn btn-ghost" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDelete(p.product_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!initialLoading && filtered.length > PAGE_SIZE && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '16px 0',
          }}
        >
          <span style={{ fontSize: 13, color: '#64748B' }}>
            Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} products
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {visibleCount < filtered.length && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                See more
              </button>
            )}
            {visibleCount > PAGE_SIZE && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setVisibleCount(PAGE_SIZE)}
              >
                See less
              </button>
            )}
          </div>
        </div>
      )}
    </FarmerLayout>
  );
}