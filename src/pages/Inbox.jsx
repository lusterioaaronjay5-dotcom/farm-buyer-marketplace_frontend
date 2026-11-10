import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ChatBox from '../components/ChatBox';
import './Inbox.css';

function getMe() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    return u?.user_id ?? u?.id ?? null;
  } catch {
    return null;
  }
}

function formatTime(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function Inbox() {
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const me = getMe();

  const activeId = Number(params.get('with')) || null;

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

  const active = list.find((c) => getOtherId(c) === activeId) || null;

  function openChat(id) {
    setParams({ with: String(id) });
  }

  return (
    <div className="inbox">
      <header className="inbox-head">
        <h1>Messages</h1>
        <p>Mga usapan mo sa mga farmer o buyer.</p>
      </header>

      <div className="inbox-grid">
        <aside className="inbox-list">
          {loading && <p className="inbox-muted">Naglo-load...</p>}
          {error && <p className="inbox-error">{error}</p>}
          {!loading && !error && list.length === 0 && (
            <p className="inbox-muted">Wala ka pang usapan.</p>
          )}

          {list.map((c) => {
            const id = getOtherId(c);
            const unread = Number(c.unread_count ?? c.unread ?? 0);
            const isActive = id === activeId;
            return (
              <button
                key={id}
                type="button"
                className={`inbox-item ${isActive ? 'is-active' : ''}`}
                onClick={() => openChat(id)}
              >
                <span className="inbox-avatar">
                  {(c.full_name || '?').charAt(0).toUpperCase()}
                </span>
                <span className="inbox-info">
                  <span className="inbox-name">
                    {c.full_name || 'Unknown'}
                    {unread > 0 && <span className="inbox-badge">{unread}</span>}
                  </span>
                  <span className="inbox-last">{c.last_message ?? c.body ?? ''}</span>
                </span>
                <span className="inbox-time">{formatTime(c.last_at ?? c.created_at)}</span>
              </button>
            );
          })}
        </aside>

        <section className="inbox-pane">
          {activeId && active ? (
            <ChatBox withUserId={activeId} withName={active.full_name} me={me} />
          ) : activeId ? (
            <ChatBox withUserId={activeId} withName="Usapan" me={me} />
          ) : (
            <div className="inbox-empty">
              <p>Pumili ng usapan sa kaliwa para magsimulang mag-reply.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function getOtherId(c) {
  return Number(c.user_id ?? c.other_user_id ?? c.id) || null;
}