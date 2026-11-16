import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './FarmerLayout.css';

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
  report: (
    <svg {...SVG}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
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
  { to: '/admin', label: 'Admin Panel', icon: 'dashboard' },
  { to: '/reports', label: 'Reports', icon: 'report' },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = getStoredUser();
  const name = user?.full_name || 'Admin';
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
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `fs-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setNavOpen(false)}
            >
              <span className="fs-icon">{ICONS[item.icon]}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
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
            <span className="fs-crumb">Admin Portal</span>
          </div>

          <div className="fs-user">
            <button
              type="button"
              className="fs-user-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
            >
              <span className="fs-avatar">{initials || 'A'}</span>
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
    </div>
  );
}