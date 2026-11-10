import { useLayoutEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';
import BuyerLayout from '../components/BuyerLayout';
import FarmerLayout from '../components/FarmerLayout';
import useApiData from '../useApiData';
import { setCached } from '../dataCache';
import './Profile.css';

const MAX_SIZE = 1024 * 1024; // 1MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

function getInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function InfoItem({ label, value, full = false }) {
  return (
    <div className={`pf-view-item${full ? ' pf-full' : ''}`}>
      <span className="pf-view-label">{label}</span>
      <span className={`pf-view-value${value ? '' : ' pf-empty'}`}>
        {value || 'Wala pa'}
      </span>
    </div>
  );
}

export default function Profile() {
  const token = localStorage.getItem('token');
  const storedUser = getStoredUser();
  const Layout = storedUser?.role === 'farmer' ? FarmerLayout : BuyerLayout;

  // Cache-first: kapag may laman na ang cache, agad lalabas ang profile
  const { data, loading, error: loadError } = useApiData('profile', '/profile');

  // Saved data from the server (used for the preview / view mode)
  const [saved, setSaved] = useState({
    full_name: '',
    email: '',
    role: storedUser?.role || '',
    phone: '',
    address: '',
    profile_picture: null,
  });

  // Editable copy (used in edit mode)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });
  const [newPicture, setNewPicture] = useState(null); // data URL waiting to be saved
  const [removePicture, setRemovePicture] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fileRef = useRef(null);

  function applyProfile(p) {
    const next = {
      full_name: p.full_name || '',
      email: p.email || '',
      role: p.role || '',
      phone: p.phone || '',
      address: p.address || '',
      profile_picture: p.profile_picture || null,
    };
    setSaved(next);
    setForm({
      full_name: next.full_name,
      phone: next.phone,
      address: next.address,
    });
  }

  // useLayoutEffect para hindi makita ang blangkong form bago lumabas ang data
  useLayoutEffect(() => {
    if (data?.profile) applyProfile(data.profile);
  }, [data]);

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  const shownError = error || loadError;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage('');
    setError('');
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;

    setError('');
    setMessage('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Gamitin ang PNG, JPG, o WEBP lang.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('Masyadong malaki ang larawan. Max 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewPicture(reader.result);
      setRemovePicture(false);
    };
    reader.onerror = () => setError('Hindi mabasa ang larawan.');
    reader.readAsDataURL(file);
  }

  function cancelNewPicture() {
    setNewPicture(null);
  }

  function removeCurrentPicture() {
    setNewPicture(null);
    setRemovePicture(true);
    setMessage('');
    setError('');
  }

  function startEdit() {
    setMessage('');
    setError('');
    setEditing(true);
  }

  function cancelEdit() {
    // Reset the form back to the saved values
    setForm({
      full_name: saved.full_name,
      phone: saved.phone,
      address: saved.address,
    });
    setNewPicture(null);
    setRemovePicture(false);
    setMessage('');
    setError('');
    setEditing(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.full_name.trim()) {
      setError('Kailangan ang buong pangalan.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        remove_picture: removePicture,
      };

      if (newPicture) {
        payload.profile_picture = newPicture;
      }

      const res = await api.post('/profile', payload);
      const p = res.data.profile;

      applyProfile(p);
      // I-update ang cache para tama ang data sa susunod na pagbalik sa page
      setCached('profile', { profile: p });
      setNewPicture(null);
      setRemovePicture(false);
      setEditing(false);

      try {
        const currentUser = getStoredUser() || {};
        localStorage.setItem(
          'user',
          JSON.stringify({ ...currentUser, full_name: p.full_name })
        );
      } catch {
        // storage can fail in private mode; the save itself already succeeded
      }

      setMessage(res.data.message || 'Na-save ang profile.');
    } catch (err) {
      setError(err.response?.data?.message || 'Hindi na-save ang profile.');
    } finally {
      setSaving(false);
    }
  }

  // Picture to show depends on the mode
  const editPicture = newPicture || (!removePicture ? saved.profile_picture : null);
  const viewPicture = saved.profile_picture;

  const messages = (
    <>
      {shownError && <p className="pf-error">{shownError}</p>}
      {message && <p className="pf-ok">{message}</p>}
    </>
  );

  return (
    <Layout>
      <div className="pf-page">
        <header className="pf-header">
          <p className="pf-eyebrow">Account</p>
          <h1>My Profile</h1>
          <p className="pf-sub">
            {editing
              ? 'I-update ang iyong personal na impormasyon at larawan.'
              : 'Ito ang iyong kasalukuyang profile.'}
          </p>
        </header>

        {loading ? (
          <p className="pf-loading">Naglo-load...</p>
        ) : !editing ? (
          /* ---------- VIEW MODE (preview) ---------- */
          <div className="pf-card">
            <div className="pf-picture-row">
              <div className="pf-avatar">
                {viewPicture ? (
                  <img src={viewPicture} alt="Profile" />
                ) : (
                  <span>{getInitials(saved.full_name)}</span>
                )}
              </div>

              <div className="pf-picture-actions">
                <strong className="pf-view-name">
                  {saved.full_name || 'Wala pang pangalan'}
                </strong>
                <span className="badge badge-accent">{capitalize(saved.role)}</span>
              </div>
            </div>

            <div className="pf-view-grid">
              <InfoItem label="Email" value={saved.email} />
              <InfoItem label="Phone" value={saved.phone} />
              <InfoItem label="Address" value={saved.address} full />
            </div>

            {messages}

            <div className="pf-actions">
              <button type="button" className="pf-save" onClick={startEdit}>
                I-edit ang Profile
              </button>
            </div>
          </div>
        ) : (
          /* ---------- EDIT MODE ---------- */
          <form className="pf-card" onSubmit={handleSave}>
            <div className="pf-picture-row">
              <div className="pf-avatar">
                {editPicture ? (
                  <img src={editPicture} alt="Profile" />
                ) : (
                  <span>{getInitials(form.full_name)}</span>
                )}
              </div>

              <div className="pf-picture-actions">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFile}
                  hidden
                />

                <button
                  type="button"
                  className="pf-btn"
                  onClick={() => fileRef.current?.click()}
                >
                  Pumili ng larawan
                </button>

                {newPicture && (
                  <button type="button" className="pf-btn-ghost" onClick={cancelNewPicture}>
                    Kanselahin ang bagong larawan
                  </button>
                )}

                {!newPicture && editPicture && (
                  <button type="button" className="pf-btn-ghost" onClick={removeCurrentPicture}>
                    Alisin ang larawan
                  </button>
                )}

                <small>PNG, JPG, o WEBP. Max 1MB.</small>
              </div>
            </div>

            <div className="pf-grid">
              <label className="pf-field pf-full">
                <span>Buong pangalan</span>
                <input
                  name="full_name"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </label>

              <label className="pf-field">
                <span>Email</span>
                <input
                  name="email"
                  autoComplete="off"
                  value={saved.email}
                  disabled
                />
              </label>

              <label className="pf-field">
                <span>Role</span>
                <input
                  name="role"
                  autoComplete="off"
                  value={capitalize(saved.role)}
                  disabled
                />
              </label>

              <label className="pf-field">
                <span>Phone</span>
                <input
                  name="phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="09XX XXX XXXX"
                />
              </label>

              <label className="pf-field pf-full">
                <span>Address</span>
                <textarea
                  name="address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                />
              </label>
            </div>

            {messages}

            <div className="pf-actions pf-actions-split">
              <button type="button" className="pf-btn-ghost" onClick={cancelEdit}>
                Kanselahin
              </button>
              <button type="submit" className="pf-save" disabled={saving}>
                {saving ? 'Sine-save...' : 'I-save ang Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}