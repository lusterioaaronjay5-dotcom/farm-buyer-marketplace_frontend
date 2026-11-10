import { useEffect, useState } from 'react';
import api from '../api';
import ChatBox from './ChatBox';
import './MessagesModal.css';

function getMe() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    return u?.user_id ?? u?.id ?? null;
  } catch {
    return null;
  }
}

function getOtherId(c) {
  return Number(c.user_id ?? c.other_user_id ?? c.id) || null;
}

function formatTime(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function MessagesModal({ onClose }) {
  const me = getMe();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState(null);

  function loadInbox() {
    api
      .get('/messages/inbox')
      .then((res) => {
        const rows = res.data?.conversations ?? res.data ?? [];
        setList(Array.isArray(rows) ? rows : []);
        setError('');
      })
      .catch(() => setError('Hindi ma-load ang mga mensahe.'))
      .finally(() => setLoading(false));
  }

  // I-load agad, at i-refresh kada 8 segundo para lumabas ang bagong mensahe
  useEffect(() => {
    loadInbox();
    const timer = setInterval(loadInbox, 8000);
    return () => clearInterval(timer);
  }, []);

  // Isara sa Escape key at i-lock ang scroll ng page habang bukas ang popup
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const active = list.find((c) => getOtherId(c) === activeId) || null;

  return (
    <div className="msg-backdrop" onClick={onClose}>
      <div
        className="msg-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="msg-head">
          <div>
            <span className="msg-kicker">Inbox</span>
            <h2>Messages</h2>
          </div>
          <button type="button" className="msg-x" onClick={onClose} aria-label="Isara">
            ✕
          </button>
        </header>

        <div className="msg-grid">
          <aside className="msg-list">
            {loading && <p className="msg-muted">Naglo-load...</p>}
            {error && <p className="msg-error">{error}</p>}
            {!loading && !error && list.length === 0 && (
              <p className="msg-muted">Wala ka pang usapan.</p>
            )}

            {list.map((c) => {
              const id = getOtherId(c);
              const unread = Number(c.unread_count ?? c.unread ?? 0);
              return (
                <button
                  key={id}
                  type="button"
                  className={`msg-item ${id === activeId ? 'is-active' : ''}`}
                  onClick={() => setActiveId(id)}
                >
                  <span className="msg-avatar">
                    {(c.full_name || '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="msg-info">
                    <span className="msg-name">
                      {c.full_name || 'Unknown'}
                      {unread > 0 && <span className="msg-badge">{unread}</span>}
                    </span>
                    <span className="msg-last">{c.last_body ?? c.last_message ?? ''}</span>
                  </span>
                  <span className="msg-time">{formatTime(c.last_at ?? c.created_at)}</span>
                </button>
              );
            })}
          </aside>

          <section className="msg-pane">
            {activeId ? (
              <ChatBox
                key={activeId}
                withUserId={activeId}
                withName={active?.full_name || 'Usapan'}
                me={me}
              />
            ) : (
              <div className="msg-empty">
                <p>Pumili ng usapan sa kaliwa para magsimulang mag-reply.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}