import { Link } from 'react-router-dom';
import './Landing.css';
import './Service.css';

const svgProps = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ICONS = {
  listing: (
    <svg {...svgProps}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  ),
  discover: (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  filter: (
    <svg {...svgProps}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),
  connect: (
    <svg {...svgProps}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  manage: (
    <svg {...svgProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  orders: (
    <svg {...svgProps}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 12h6M9 16h4" />
    </svg>
  ),
  farm: (
    <svg {...svgProps}>
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16z" />
      <path d="M4 20c3-4 6-6 10-8" />
    </svg>
  ),
  cart: (
    <svg {...svgProps}>
      <path d="M6 6h15l-2 9H8L6 3H3" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  ),
  steps: (
    <svg {...svgProps}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  ),
  shield: (
    <svg {...svgProps}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  handshake: (
    <svg {...svgProps}>
      <path d="M3 12l4-4 4 2 3-2 4 4-5 5a2 2 0 0 1-3 0z" />
      <path d="M7 12l2 2" />
    </svg>
  ),
  leaf: (
    <svg {...svgProps}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19l6-6" />
    </svg>
  ),
  check: (
    <svg {...svgProps}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
};

const Icon = ({ name }) => <span className="sv-icon">{ICONS[name]}</span>;

const CORE_SERVICES = [
  { icon: 'listing', title: 'Farmer Product Listing', text: 'Allow farmers to showcase their agricultural products by providing product names, descriptions, prices, images, and available quantities.' },
  { icon: 'discover', title: 'Online Product Discovery', text: 'Allow buyers to browse and discover agricultural products listed by local farmers.' },
  { icon: 'filter', title: 'Product Search and Filtering', text: 'Help buyers find products more easily through search and available product categories or filters.' },
  { icon: 'connect', title: 'Direct Farmer-to-Buyer Connection', text: 'Provide an online platform where farmers and buyers can connect regarding available agricultural products.' },
  { icon: 'manage', title: 'Product and Availability Management', text: 'Help farmers manage their listed products, update prices, and maintain available product quantities.' },
  { icon: 'orders', title: 'Order Management', text: 'Provide a convenient way to submit, view, and manage orders between farmers and buyers.' },
];

const FARMER_POINTS = [
  'Create and manage farmer profiles.',
  'Upload agricultural products.',
  'Set product prices.',
  'Update product availability.',
  'Receive and manage buyer orders.',
  'Expand product visibility to potential buyers.',
];

const BUYER_POINTS = [
  'Browse available agricultural products.',
  'Search and filter product listings.',
  'View product prices and descriptions.',
  'Discover farmer profiles and locations.',
  'Connect directly with farmers.',
  'Submit and monitor orders.',
];

const PROCESS = [
  { no: '01', title: 'Farmers Register', text: 'Farmers create an account and establish their marketplace profile.', icon: 'farm' },
  { no: '02', title: 'Products Are Listed', text: 'Farmers upload their agricultural products with prices, descriptions, and available quantities.', icon: 'cart' },
  { no: '03', title: 'Buyers Discover', text: 'Buyers browse, search, and explore available agricultural products.', icon: 'discover' },
  { no: '04', title: 'Orders and Connections', text: 'Buyers submit orders and connect with farmers regarding their purchases.', icon: 'handshake' },
];

const WHY = [
  { icon: 'steps', title: 'Improved Market Access', text: 'Reach buyers beyond your usual selling locations.' },
  { icon: 'connect', title: 'Direct Connections', text: 'Talk with farmers and buyers without middlemen.' },
  { icon: 'shield', title: 'Transparent Product Information', text: 'Clear prices, descriptions, and availability on every listing.' },
  { icon: 'leaf', title: 'Support for Local Farmers', text: 'A platform built to help local agriculture grow.' },
];

export default function Service() {
  return (
    <div className="landing services">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link to="/" className="lp-logo">
            <span className="lp-logo-mark">{ICONS.leaf}</span>
            <span>FarmConnect</span>
          </Link>
          <nav className="lp-links">
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/service" className="is-active">Services</Link>
          </nav>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-link-btn">Log in</Link>
            <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* SECTION 1 – HERO */}
      <section className="sv-hero">
        <div className="lp-wrap sv-hero-grid">
          <div className="sv-copy">
            <span className="sv-eyebrow">Our Services</span>
            <h1 className="sv-title">
              Bringing Farmers and Buyers <span>Closer Together.</span>
            </h1>
            <p className="sv-text">
              Discover the services of FarmConnect, designed to make agricultural products more accessible and help local farmers connect with potential buyers through a convenient online marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 – CORE SERVICES */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="sv-head">
            <span className="sv-eyebrow">Core Services</span>
            <h2 className="sv-h2">Services Designed for Better Farm-to-Market Connections</h2>
          </div>
          <div className="sv-grid">
            {CORE_SERVICES.map((s) => (
              <article className="sv-card" key={s.title}>
                <Icon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 – FOR FARMERS */}
      <section className="lp-section">
        <div className="lp-wrap sv-split">
          <div className="sv-media">
            <img src="/landing-about.jpg" alt="Fresh produce harvested from a local farm" />
          </div>
          <div className="sv-copy">
            <span className="sv-eyebrow">For Farmers</span>
            <h2 className="sv-h2">Helping Local Farmers Grow Their Market.</h2>
            <p className="sv-text">
              FarmConnect provides local farmers with digital tools to showcase their products and reach potential buyers beyond their usual selling locations.
            </p>
            <ul className="sv-checks">
              {FARMER_POINTS.map((p) => <li key={p}><span>{ICONS.check}</span>{p}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 4 – FOR BUYERS (reversed) */}
      <section className="lp-section">
        <div className="lp-wrap sv-split reverse">
          <div className="sv-copy">
            <span className="sv-eyebrow">For Buyers</span>
            <h2 className="sv-h2">Making Fresh Agricultural Products Easier to Find.</h2>
            <p className="sv-text">
              FarmConnect helps buyers discover agricultural products from local farmers through an accessible online marketplace.
            </p>
            <ul className="sv-checks">
              {BUYER_POINTS.map((p) => <li key={p}><span>{ICONS.check}</span>{p}</li>)}
            </ul>
          </div>
          <div className="sv-media">
            <img src="/landing-service.jpg" alt="Local farm produce ready for buyers" />
          </div>
        </div>
      </section>

      {/* SECTION 5 – HOW IT WORKS */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="sv-head">
            <span className="sv-eyebrow">How It Works</span>
            <h2 className="sv-h2">Simple Steps. Better Connections.</h2>
          </div>
          <div className="sv-steps">
            {PROCESS.map((p) => (
              <div className="sv-step" key={p.no}>
                <div className="sv-step-top">
                  <Icon name={p.icon} />
                  <span className="sv-step-no">{p.no}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 – WHY */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="sv-head">
            <span className="sv-eyebrow">Why FarmConnect</span>
            <h2 className="sv-h2">Why Choose FarmConnect?</h2>
          </div>
          <div className="sv-why">
            {WHY.map((w) => (
              <div className="sv-card" key={w.title}>
                <Icon name={w.icon} />
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 – CTA */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="sv-cta">
            <h2>Let's Build Stronger Connections in Agriculture.</h2>
            <p>
              Whether you're a farmer looking to reach more buyers or a buyer searching for local agricultural products, FarmConnect makes it easier to connect.
            </p>
            <div className="sv-actions center">
              <Link to="/marketplace" className="lp-btn lp-btn-primary">Explore Marketplace</Link>
              <Link to="/register" className="lp-btn lp-btn-outline">Join as a Farmer</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 – FOOTER */}
      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-grid">
          <div>
            <div className="lp-logo">
              <span className="lp-logo-mark">{ICONS.leaf}</span>
              <span>FarmConnect</span>
            </div>
            <p>A digital marketplace connecting local farmers with buyers.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/service">Services</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <p>hello@farmconnect.example</p>
            <p>+63 900 000 0000</p>
          </div>
        </div>
        <div className="lp-wrap lp-copy">© {new Date().getFullYear()} FarmConnect. All rights reserved.</div>
      </footer>
    </div>
  );
}