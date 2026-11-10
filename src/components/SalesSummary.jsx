import { useCallback, useEffect, useState } from 'react';
import useApiData from '../useApiData';
import './SalesSummary.css';

function peso(value) {
  return '₱' + Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function compactPeso(value) {
  const n = Number(value || 0);
  if (n >= 1000) return '₱' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return '₱' + Math.round(n);
}

function shortDay(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function shortMonth(ym) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-PH', { month: 'short' });
}

const TICKS = [1, 0.75, 0.5, 0.25];

function BarChart({ bars }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(0, ...bars.map((b) => b.value));
  const top = max > 0 ? max : 1;

  return (
    <div className="sc">
      <div className="sc-axis">
        {TICKS.map((t) => (
          <span key={t} style={{ '--t': t }}>{compactPeso(top * t)}</span>
        ))}
        <span style={{ '--t': 0 }}>₱0</span>
      </div>

      <div className="sc-main">
        {[...TICKS, 0].map((t) => (
          <div key={t} className="sc-grid" style={{ '--t': t }} />
        ))}

        <div className="sc-bars">
          {bars.map((b, i) => {
            const pct = (b.value / top) * 100;
            return (
              <div
                key={b.key}
                className={`sc-col ${hover === i ? 'is-hover' : ''}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === i && (
                  <div className="sc-tip">
                    <strong>{peso(b.value)}</strong>
                    <span>{b.tip}</span>
                  </div>
                )}
                <div className="sc-bar-wrap">
                  <div
                    className={`sc-bar ${b.value > 0 ? '' : 'is-empty'}`}
                    style={{ height: `${pct}%`, animationDelay: `${Math.min(i, 30) * 25}ms` }}
                  />
                </div>
                <span className="sc-x">{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SpeedList({ items, empty }) {
  if (items.length === 0) {
    return <p className="sm-note">{empty}</p>;
  }

  return items.map((p) => (
    <div className="sm-prod" key={p.product_id}>
      <div>
        <strong>{p.product_name}</strong>
        <span>{p.units_window} units sa 30 araw · {p.velocity} / araw</span>
      </div>
      <em>{p.days_to_sold_out != null ? `~${p.days_to_sold_out} araw` : '—'}</em>
    </div>
  ));
}

function SalesModal({ kind, data, onClose }) {
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

  const isSpeed = kind === 'speed';
  const fast = data.products.filter((p) => p.speed === 'mabilis');
  const slow = data.products.filter((p) => p.speed === 'matagal');
  const none = data.products.filter((p) => p.speed === 'walang_benta');

  return (
    <div className="sm-backdrop" onClick={onClose}>
      <div
        className="sm-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sm-head">
          <div>
            <span className="sm-kicker">{isSpeed ? 'Bilis ng benta' : 'Prediksyon'}</span>
            <h2>{isSpeed ? 'Mabilis at matagal maubos' : 'Posibleng susunod na mabenta'}</h2>
          </div>
          <button type="button" className="sm-x" onClick={onClose} aria-label="Isara">
            ✕
          </button>
        </header>

        <div className="sm-body">
          {isSpeed ? (
            <>
              <div className="sm-cols">
                <section className="sm-col">
                  <h3 className="sm-col-title is-fast">Mabilis maubos</h3>
                  <SpeedList items={fast} empty="Wala pang mabilis na benta." />
                </section>
                <section className="sm-col">
                  <h3 className="sm-col-title is-slow">Matagal maubos</h3>
                  <SpeedList items={slow} empty="Wala pang matagal na benta." />
                </section>
              </div>
              {none.length > 0 && (
                <p className="sm-note">
                  Walang benta sa huling 30 araw: {none.map((p) => p.product_name).join(', ')}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="sm-note">Estimate lang base sa benta ng nakaraang 30 araw.</p>
              {data.predicted.length === 0 ? (
                <p className="sm-note">Wala pang sapat na datos.</p>
              ) : (
                data.predicted.map((p, i) => (
                  <div className="sm-pred" key={p.product_id}>
                    <span className="sm-rank">{i + 1}</span>
                    <div>
                      <strong>{p.product_name}</strong>
                      <span>{p.reason}</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SalesSummary() {
  const { data, loading, error } = useApiData('farmer:sales', '/farmer/sales-summary');
  const [view, setView] = useState('daily');
  const [modal, setModal] = useState(null);
  const closeModal = useCallback(() => setModal(null), []);

  if (loading && !data) {
    return (
      <section className="card sc-card">
        <p className="sc-muted">Naglo-load ng benta...</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="card sc-card">
        <p className="sc-error">Hindi ma-load ang benta.</p>
      </section>
    );
  }

  const bars =
    view === 'daily'
      ? data.daily.map((d, i) => ({
          key: d.date,
          label: i % 5 === 0 ? shortDay(d.date) : '',
          value: d.amount,
          tip: `${shortDay(d.date)} · ${d.units} units`,
        }))
      : data.monthly.map((m) => ({
          key: m.month,
          label: shortMonth(m.month),
          value: m.amount,
          tip: shortMonth(m.month),
        }));

  const fastCount = data.products.filter((p) => p.speed === 'mabilis').length;
  const slowCount = data.products.filter((p) => p.speed === 'matagal').length;
  const topPick = data.predicted[0];

  return (
    <div className="ss">
      <div className="ss-totals">
        <div className="ss-total">
          <span>Benta ngayong araw</span>
          <strong>{peso(data.totals.today)}</strong>
        </div>
        <div className="ss-total">
          <span>Benta ngayong buwan</span>
          <strong>{peso(data.totals.month)}</strong>
        </div>
        <div className="ss-total">
          <span>Benta ngayong taon</span>
          <strong>{peso(data.totals.year)}</strong>
        </div>
      </div>

      <section className="card sc-card">
        <div className="ss-head">
          <div>
            <h2>Benta</h2>
            <p className="sc-muted">
              {view === 'daily' ? 'Benta kada araw sa huling 30 araw' : 'Benta kada buwan ngayong taon'}
            </p>
          </div>
          <div className="ss-toggle">
            <button
              type="button"
              className={view === 'daily' ? 'is-active' : ''}
              onClick={() => setView('daily')}
            >
              30 araw
            </button>
            <button
              type="button"
              className={view === 'monthly' ? 'is-active' : ''}
              onClick={() => setView('monthly')}
            >
              Buwan
            </button>
          </div>
        </div>

        <BarChart bars={bars} />
      </section>

      <div className="ss-actions">
        <button type="button" className="ss-action" onClick={() => setModal('speed')}>
          <span className="ss-action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
            </svg>
          </span>
          <span className="ss-action-text">
            <strong>Mabilis at matagal maubos</strong>
            <small>{fastCount} mabilis · {slowCount} matagal</small>
          </span>
          <span className="ss-action-arrow">›</span>
        </button>

        <button type="button" className="ss-action" onClick={() => setModal('predict')}>
          <span className="ss-action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
            </svg>
          </span>
          <span className="ss-action-text">
            <strong>Susunod na mabenta</strong>
            <small>{topPick ? `Top: ${topPick.product_name}` : 'Wala pang datos'}</small>
          </span>
          <span className="ss-action-arrow">›</span>
        </button>
      </div>

      {modal && <SalesModal kind={modal} data={data} onClose={closeModal} />}
    </div>
  );
}