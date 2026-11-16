import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import FarmerLayout, { StatCard } from '../components/FarmerLayout';
import useApiData from '../useApiData';
import './FarmerProducts.css';

// Kapag ito o mas mababa, "Ubos na" ang status. Puwede mong palitan ang numero.
const LOW_STOCK = 10;

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

function stockStatus(qty) {
  const n = Number(qty) || 0;
  if (n <= 0) return { label: 'Wala na', cls: 'badge-danger' };
  if (n <= LOW_STOCK) return { label: 'Ubos na', cls: 'badge-warning' };
  return { label: 'Maayos', cls: 'badge-success' };
}

function FarmerStock() {
  const { data, loading, error } = useApiData('farmer:products', '/farmer/products');
  const [search, setSearch] = useState('');

  const products = data?.products || [];

  // Pinakamaliit na stock muna para makita agad ang kailangang i-restock
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter(
        (p) =>
          !q ||
          (p.product_name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      )
      .sort((a, b) => Number(a.quantity_available) - Number(b.quantity_available));
  }, [products, search]);

  const lowCount = products.filter((p) => Number(p.quantity_available) <= LOW_STOCK).length;
  const outCount = products.filter((p) => Number(p.quantity_available) <= 0).length;

  return (
    <FarmerLayout>
      <h1 className="page-title">My Stock</h1>

      <div className="stat-row">
        <StatCard label="Total Produkto" value={products.length} />
        <StatCard label={`Ubos na (${LOW_STOCK} pababa)`} value={lowCount} />
        <StatCard label="Wala na" value={outCount} />
      </div>

      <div className="toolbar">
        <h2>Stock ng Bawat Produkto</h2>

        <div className="filter-row">
          <input
            type="text"
            className="filter-input"
            placeholder="Maghanap ng produkto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="farmer-error">{error}</div>}

      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data && (
              <tr>
                <td colSpan="4" className="empty-cell">Naglo-load...</td>
              </tr>
            )}

            {data && rows.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-cell">Walang produktong tumugma.</td>
              </tr>
            )}

            {rows.map((p) => {
              const st = stockStatus(p.quantity_available);
              return (
                <tr key={p.product_id}>
                  <td>{p.product_name}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity_available} {p.unit}</td>
                  <td>
                    <span className={`badge ${st.cls}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </FarmerLayout>
  );
}

export default function StockPage() {
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'farmer') {
    return <Navigate to="/marketplace" replace />;
  }

  return <FarmerStock />;
}