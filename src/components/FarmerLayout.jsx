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
  leaf: (
    <svg {...SVG}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19l6-6" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/farmer/products', label: 'My Products', icon: 'products' },
  { to: '/farmer/orders', label: 'Received Orders', icon: 'orders' },
  { to: '/farmer/messages', label: 'Messages', icon: 'messages', popup: true },
  { to: '/profile', label: 'My Profile', icon: 'profile' },
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const closeMessages = useCallback(() => setMessagesOpen(false), []);
  // Magre-refresh ang count kapag nagsara ang popup, para mawala ang badge kung nabasa na
  const unread = useUnreadMessages(messagesOpen);

  const user = getStoredUser();
  const name = user?.full_name || 'Farmer';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  return (
    <div className={`farmer-shell ${navOpen ? 'nav-open' : ''}`}>
      <aside className="farmer-sidebar">
        <div className="fs-brand">
          <span className="fs-logo">{ICONS.leaf}</span>
          <span>FarmConnect</span>
        </div>

        <p className="fs-section">Menu</p>

        <nav className="fs-nav">
          {NAV_ITEMS.map((item) =>
            item.popup ? (
              <a
                key={item.to}
                href="#messages"
                className="fs-link"
                onClick={(e) => {
                  e.preventDefault();
                  setNavOpen(false);
                  setMessagesOpen(true);
                }}
              >
                <span className="fs-icon">{ICONS[item.icon]}</span>
                <span>{item.label}</span>
                {unread > 0 && (
                  <span className="nav-count">{unread > 99 ? '99+' : unread}</span>
                )}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `fs-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setNavOpen(false)}
              >
                <span className="fs-icon">{ICONS[item.icon]}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <button type="button" className="fs-logout" onClick={handleLogout}>
          <span className="fs-icon">{ICONS.logout}</span>
          <span>Logout</span>
        </button>
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

          <div className="fs-user">
            <button
              type="button"
              className="fs-user-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
            >
              <span className="fs-avatar">{initials || 'F'}</span>
              <span className="fs-name">{name}</span>
            </button>

            {menuOpen && (
              <div className="fs-dropdown">
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  <span className="fs-icon">{ICONS.profile}</span>
                  <span>My Profile</span>
                </Link>
                <button type="button" onClick={handleLogout}>
                  <span className="fs-icon">{ICONS.logout}</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="farmer-main">{children}</main>
      </div>

      {messagesOpen && <MessagesModal onClose={closeMessages} />}
    </div>
  );
}