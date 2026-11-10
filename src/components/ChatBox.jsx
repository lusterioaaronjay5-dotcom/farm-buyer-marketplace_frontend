import { useEffect, useRef, useState } from 'react';
import api from '../api';
import './ChatBox.css';

const POLL_MS = 5000;

function formatTime(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  if (isNaN(d)) return '';
  return d.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatBox({ withUserId, withName, me }) {
  const [messages, setMessages] = useState([]);
  const [other, setOther] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  async function loadThread() {
    try {
      const res = await api.get('/messages/thread', { params: { with: withUserId } });
      setMessages(res.data.messages || []);
      setOther(res.data.with || null);
      setError('');
    } catch {
      setError('Hindi ma-load ang usapan.');
    }
  }

  useEffect(() => {
    loadThread();
    const timer = setInterval(loadThread, POLL_MS);
    return () => clearInterval(timer);
  }, [withUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    setError('');
    try {
      await api.post('/messages', { receiver_id: Number(withUserId), body });
      setText('');
      await loadThread();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Hindi naipadala ang mensahe.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat">
      <div className="chat-head">
        <div>
          <strong>{other?.full_name || withName || 'Usapan'}</strong>
          {other?.role && (
            <span className="chat-role">{other.role === 'farmer' ? 'Farmer' : 'Buyer'}</span>
          )}
        </div>
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <p className="chat-empty">Wala pang mensahe. Simulan ang usapan.</p>
        )}

        {messages.map((m) => {
          const mine = Number(m.sender_id) === Number(me);
          return (
            <div key={m.message_id} className={`chat-row ${mine ? 'is-mine' : ''}`}>
              <div className="chat-bubble">{m.body}</div>
              <span className="chat-time">{formatTime(m.created_at)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="chat-error">{error}</p>}

      <form className="chat-form" onSubmit={handleSend}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I-type ang mensahe..."
          maxLength={1000}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          {sending ? '...' : 'Ipadala'}
        </button>
      </form>
    </div>
  );
}
