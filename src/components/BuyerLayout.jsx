import { useCallback, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearCache } from '../dataCache';
import MessagesModal from '../components/MessagesModal';
import useUnreadMessages from '../hooks/useUnreadMessages';
import './BuyerLayout.css';

const NAV_ITEMS = [
  { to: '/buyer/dashboard', label: 'Dashboard', title: 'Dashboard' },
  { to: '/marketplace', label: 'Marketplace', title: 'Marketplace' },
  { to: '/cart', label: 'My Cart', title: 'Shopping Cart' },
  { to: '/my-orders', label: 'My Orders', title: 'My Orders' },
  { to: '/reports', label: 'Reports', title: 'Reports' },
  { to: '/buyer/messages', label: 'Messages', title: 'Messages', popup: true },
  { to: '/profile', label: 'My Profile', title: 'My Profile' },
];

const MENU_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

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

export default function BuyerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  const [navOpen, setNavOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const closeMessages = useCallback(() => setMessagesOpen(false), []);
  // Magre-refresh ang count kapag nagsara ang popup, para mawala ang badge kung nabasa na
  const unread = useUnreadMessages(messagesOpen);

  const current =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.to)) ||
    { title: 'Product Details' };

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearCache();
    setNavOpen(false);
    navigate('/');
  }

  const isLoggedIn = Boolean(token && user);

  return (
    <div className={`buyer-shell ${navOpen ? 'nav-open' : ''}`}>
      <aside className="buyer-sidebar">
        {isLoggedIn && (
          <div className="buyer-account">
            <span className="buyer-avatar">{getInitials(user.full_name)}</span>
            <span className="buyer-account-name">{user.full_name || 'Buyer'}</span>
          </div>
        )}

        <nav className="buyer-nav">
          {NAV_ITEMS.map((item) =>
            item.popup ? (
              <a
                key={item.to}
                href="#messages"
                onClick={(e) => {
                  e.preventDefault();
                  setNavOpen(false);
                  setMessagesOpen(true);
                }}
              >
                {item.label}
                {unread > 0 && (
                  <span className="nav-count">{unread > 99 ? '99+' : unread}</span>
                )}
              </a>
            ) : (
              <NavLink key={item.to} to={item.to} onClick={() => setNavOpen(false)}>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {token && (
          <button type="button" className="buyer-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </aside>

      {navOpen && <div className="buyer-backdrop" onClick={() => setNavOpen(false)} />}

      <div className="buyer-main-wrap">
        <header className="buyer-topbar">
          <div className="buyer-topbar-left">
            <button
              type="button"
              className="buyer-menu-btn"
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Buksan ang menu"
            >
              {MENU_ICON}
            </button>
            <h2 className="buyer-page-title">{current.title}</h2>
          </div>

          {!isLoggedIn && (
            <NavLink to="/login" className="buyer-login-link">
              Login
            </NavLink>
          )}
        </header>

        <main className="buyer-main">{children}</main>
      </div>

      {messagesOpen && <MessagesModal onClose={closeMessages} />}
    </div>
  );
}