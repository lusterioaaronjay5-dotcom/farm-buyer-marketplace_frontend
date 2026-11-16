import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';
import './HomeHero.css';
import './Landing.css';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const ICONS = {
  leaf: (
    <svg {...svgProps}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14Z" />
      <path d="M5 19l7-7" />
    </svg>
  ),
  users: (
    <svg {...svgProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
      <path d="M18 14.6c1.8.9 2.8 2.7 3.2 5.4" />
    </svg>
  ),
  tag: (
    <svg {...svgProps}>
      <path d="M3 12.2V4a1 1 0 0 1 1-1h8.2a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-7.8 7.8a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.7-.5Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  ),
  trend: (
    <svg {...svgProps}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  ),
  card: (
    <svg {...svgProps}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 15h4" />
    </svg>
  ),
  search: (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  ),
  link: (
    <svg {...svgProps}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  ),
  bag: (
    <svg {...svgProps}>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
};

function Icon({ name }) {
  return <span className="lp-icon">{ICONS[name]}</span>;
}

const FEATURES = [
  {
    icon: 'users',
    title: 'Direct Farmer Access',
    text: 'Reach local farmers directly and know exactly where your food comes from.',
  },
  {
    icon: 'tag',
    title: 'Fair and Affordable Prices',
    text: 'Farmers set their own prices, and buyers get fresh produce without the markup.',
  },
  {
    icon: 'trend',
    title: 'Wider Market Opportunities',
    text: 'Give local farms access to buyers beyond their immediate community.',
  },
  {
    icon: 'card',
    title: 'Convenient Online Transactions',
    text: 'Browse, order, and pay online, then track your order until it arrives.',
  },
];

const STEPS = [
  {
    icon: 'search',
    title: 'Discover local products',
    text: 'Browse fresh agricultural products by category, location, and availability.',
  },
  {
    icon: 'link',
    title: 'Connect with farmers',
    text: 'View each farmer’s listings, prices, and stock before you decide what to buy.',
  },
  {
    icon: 'bag',
    title: 'Purchase directly',
    text: 'Order online and get fresh products delivered straight from the farm.',
  },
];

function GuestLanding() {
  return (
    <div className="landing">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <nav className="lp-links" aria-label="Main">
            <Link to="/" className="active">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/service">Services</Link>
          </nav>

          <div className="lp-nav-actions">
            <Link to="/login" className="lp-link-btn">Log in</Link>
            <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- HERO ---------- */}
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-copy lp-rise">
              <span className="lp-eyebrow">Local farms · Direct to buyers</span>
              <h1>
                Fresh From Local Farms, <span>Straight to Your Door.</span>
              </h1>
              <p className="lp-lead">
                Connect directly with local farmers and discover fresh, affordable
                agricultural products. Support local agriculture while making
                farm-to-market transactions easier.
              </p>

              <div className="lp-cta-row">
                <Link to="/marketplace" className="lp-btn lp-btn-primary">
                  Explore Marketplace
                </Link>
                <Link to="/register" className="lp-btn lp-btn-outline">
                  Become a Farmer
                </Link>
              </div>

              <div className="lp-chips">
                <span className="lp-chip">
                  <Icon name="users" />
                  Direct from farmers
                </span>
                <span className="lp-chip">
                  <Icon name="tag" />
                  Fair prices
                </span>
                <span className="lp-chip">
                  <Icon name="bag" />
                  Delivered to you
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- ABOUT ---------- */}
        <section className="lp-section" id="about">
          <div className="lp-wrap lp-two-col">
            <div className="lp-about-media lp-reveal">
              <img
                src="/landing-home.jpg"
                alt="Fresh produce harvested from a local farm"
              />
            </div>

            <div className="lp-about-copy lp-reveal">
              <span className="lp-eyebrow">About FarmConnect</span>
              <h2>Connecting Farmers to Better Opportunities</h2>
              <p>
                FarmConnect helps local farmers reach more buyers beyond their
                immediate community, while giving buyers direct access to fresh
                agricultural products. By cutting out unnecessary middlemen,
                farmers keep a fairer share of every sale, and buyers get produce
                that is fresher and more affordable.
              </p>

              <ul className="lp-checks">
                <li>Farmers reach buyers beyond their immediate community.</li>
                <li>Buyers access fresh produce directly from the source.</li>
                <li>Transparent prices, with fewer middlemen involved.</li>
              </ul>

              <Link to="/about" className="lp-btn lp-btn-outline">
                Learn more about us
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- FEATURES ---------- */}
        <section className="lp-section lp-section-white" id="features">
          <div className="lp-wrap">
            <div className="lp-section-head lp-reveal">
              <span className="lp-eyebrow">Why choose us</span>
              <h2>Why Choose FarmConnect?</h2>
              <p>
                Everything farmers and buyers need to trade fresh products, in one
                simple marketplace.
              </p>
            </div>

            <div className="lp-feature-grid lp-reveal">
              {FEATURES.map((f) => (
                <article className="lp-feature" key={f.title}>
                  <div className="lp-icon-wrap">
                    <Icon name={f.icon} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="lp-section" id="how-it-works">
          <div className="lp-wrap">
            <div className="lp-section-head lp-reveal">
              <span className="lp-eyebrow">How it works</span>
              <h2>Three simple steps to fresh produce</h2>
            </div>

            <div className="lp-steps lp-reveal">
              {STEPS.map((s, i) => (
                <div className="lp-step" key={s.title}>
                  <div className="lp-step-num">
                    <Icon name={s.icon} />
                  </div>
                  <span className="lp-step-tag">Step {i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="lp-cta">
          <div className="lp-wrap">
            <div className="lp-cta-box lp-reveal">
              <h2>Support Local Farmers. Grow Together.</h2>
              <p>
                Join FarmConnect and become part of a marketplace that creates
                better opportunities for local farmers and buyers.
              </p>
              <div className="lp-cta-row lp-cta-center">
                <Link to="/marketplace" className="lp-btn lp-btn-light">
                  Start Shopping
                </Link>
                <Link to="/register" className="lp-btn lp-btn-ghost-light">
                  Join as a Farmer
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-grid">
            <div>
              <Link to="/" className="lp-logo">
                <span className="lp-logo-mark">
                  <Icon name="leaf" />
                </span>
                FarmConnect
              </Link>
              <p className="lp-footer-desc">
                A marketplace that connects local farmers directly with buyers,
                for fresher produce and fairer opportunities.
              </p>
            </div>

            <div>
              <h4>Navigation</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/service">Services</Link></li>
                <li><Link to="/marketplace">Marketplace</Link></li>
              </ul>
            </div>

            <div>
              <h4>Contact</h4>
              <ul>
                <li>hello@farmconnect.example</li>
                <li>+63 900 000 0000</li>
                <li>Philippines</li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© 2026 FarmConnect. All rights reserved.</span>
            <span>Supporting local agriculture.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoggedInHome({ user }) {
  const isFarmer = user.role === 'farmer';

  return (
    <section className="hero-banner">
      <div className="hero-content">
        <p className="hero-kicker">
          {isFarmer ? 'Farmer account' : 'Buyer account'}
        </p>
        <h1>
          Welcome back, <span>{user.full_name}</span>
        </h1>
        <p>
          {isFarmer
            ? 'Pamahalaan ang mga produktong ibinebenta mo.'
            : 'Mamili ng sariwang produkto direkta sa mga farmer.'}
        </p>
        <div className="hero-banner-buttons">
          {isFarmer ? (
            <Link to="/farmer/products" className="hero-cta">Aking Produkto</Link>
          ) : (
            <Link to="/marketplace" className="hero-cta">Mamili Ngayon</Link>
          )}
          <Link to="/dashboard" className="hero-cta hero-cta-outline">
            Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  const token = localStorage.getItem('token');
  const user = getStoredUser();
  const loggedIn = Boolean(token && user);

  if (!loggedIn) {
    return <GuestLanding />;
  }

  return (
    <div className="home">
      <Navbar />
      <LoggedInHome user={user} />
      <footer className="footer">
        © 2026 FarmConnect · Supporting local agriculture.
      </footer>
    </div>
  );
}