import { useCallback, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import MessagesModal from '../components/MessagesModal';
import useUnreadMessages from '../hooks/useUnreadMessages';
import './FarmerLayout.css';

export function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const SVG = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ICONS = {
  dashboard: (
    <svg {...SVG}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  products: (
    <svg {...SVG}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  ),
  orders: (
    <svg {...SVG}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 12h6M9 16h4" />
    </svg>
  ),
  stock: (
    <svg {...SVG}>
      <path d="M4 7h16v4H4zM4 13h16v4H4z" />
    </svg>
  ),
  report: (
    <svg {...SVG}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  messages: (
    <svg {...SVG}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  profile: (
    <svg {...SVG}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  silhouette: (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6z" />
    </svg>
  ),
  sprout: (
    <svg {...SVG} width={20} height={20}>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5Z" />
    </svg>
  ),
  logout: (
    <svg {...SVG}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  menu: (
    <svg {...SVG}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/farmer/products', label: 'My Products', icon: 'products' },
  { to: '/farmer/orders', label: 'Received Orders', icon: 'orders' },
  { to: '/farmer/stock', label: 'My Stock', icon: 'stock' },
  { to: '/reports', label: 'Reports', icon: 'report' },
  { to: '/farmer/messages', label: 'Messages', icon: 'messages', popup: true },
  { to: '/profile', label: 'My Profile', icon: 'profile' },
];

const C = {
  primary: '#174D36',
  secondary: '#216642',
  sage: '#EAF3EC',
  bg: '#F7F9F6',
  card: '#FFFFFF',
  text: '#1F2937',
  muted: '#64748B',
  border: '#E5EAE6',
};

function navStyle(active) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    color: active ? C.primary : C.muted,
    background: active ? C.sage : 'transparent',
    boxShadow: active ? `inset 3px 0 0 ${C.primary}` : 'none',
    transition: 'background 0.2s ease, color 0.2s ease',
    cursor: 'pointer',
  };
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

export default function FarmerLayout({ children }) {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const closeMessages = useCallback(() => setMessagesOpen(false), []);
  // Magre-refresh ang count kapag nagsara ang popup, para mawala ang badge kung nabasa na
  const unread = useUnreadMessages(messagesOpen);

  const user = getStoredUser();
  const name = user?.full_name || 'Farmer';
  const picture = user?.profile_picture || '';

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  return (
    <div className={`farmer-shell ${navOpen ? 'nav-open' : ''}`}>
      <aside
        className="farmer-sidebar"
        style={{
          width: 256,
          maxWidth: '85vw',
          minHeight: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          background: C.card,
          borderRight: `1px solid ${C.border}`,
          padding: '22px 16px',
        }}
      >
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 8px' }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: C.primary,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {ICONS.sprout}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Farmer Portal</span>
        </div>

        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: C.muted,
            padding: '0 12px',
            margin: '22px 0 8px',
          }}
        >
          Menu
        </p>

        <nav className="fs-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) =>
            item.popup ? (
              <a
                key={item.to}
                href="#messages"
                className="fs-link"
                style={navStyle(false)}
                onClick={(e) => {
                  e.preventDefault();
                  setNavOpen(false);
                  setMessagesOpen(true);
                }}
              >
                <span style={{ display: 'flex', width: 18, height: 18, flexShrink: 0 }}>
                  {ICONS[item.icon]}
                </span>
                <span>{item.label}</span>
                {unread > 0 && (
                  <span className="nav-count">{unread > 99 ? '99+' : unread}</span>
                )}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className="fs-link"
                style={({ isActive }) => navStyle(isActive)}
                onClick={() => setNavOpen(false)}
              >
                <span style={{ display: 'flex', width: 18, height: 18, flexShrink: 0 }}>
                  {ICONS[item.icon]}
                </span>
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Profile section sa ibaba */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <Link
            to="/profile"
            onClick={() => setNavOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 12,
              background: C.bg,
              border: `1px solid ${C.border}`,
              textDecoration: 'none',
              color: C.text,
              minWidth: 0,
            }}
          >
            {picture ? (
              <img
                src={picture}
                alt={name}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
            ) : (
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: C.primary,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {ICONS.silhouette}
              </span>
            )}
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
              <span style={{ fontSize: 12, color: C.muted }}>Farmer</span>
            </span>
          </Link>

          <button
            type="button"
            className="fs-logout"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
              padding: '10px 12px',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.card,
              color: C.text,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', width: 18, height: 18 }}>{ICONS.logout}</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {navOpen && <div className="fs-backdrop" onClick={() => setNavOpen(false)} />}

      <div className="farmer-main-wrap">
        <header className="farmer-topbar">
          <div className="fs-topbar-left">
            <button
              type="button"
              className="fs-menu-btn"
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Buksan ang menu"
            >
              {ICONS.menu}
            </button>
            <span className="fs-crumb">Farmer Portal</span>
          </div>
        </header>

        <main className="farmer-main">{children}</main>
      </div>

      {messagesOpen && <MessagesModal onClose={closeMessages} />}
    </div>
  );
}