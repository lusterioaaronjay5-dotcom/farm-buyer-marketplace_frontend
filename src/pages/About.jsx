import { Link } from 'react-router-dom';
import './Landing.css';
import './About.css';

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
  target: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
  eye: (
    <svg {...svgProps}>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  expand: (
    <svg {...svgProps}>
      <path d="M4 9V4h5" />
      <path d="M20 9V4h-5" />
      <path d="M4 15v5h5" />
      <path d="M20 15v5h-5" />
    </svg>
  ),
  link: (
    <svg {...svgProps}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  ),
  scale: (
    <svg {...svgProps}>
      <path d="M12 4v16" />
      <path d="M5 8h14" />
      <path d="M5 8l-3 6h6l-3-6Z" />
      <path d="M19 8l-3 6h6l-3-6Z" />
    </svg>
  ),
  sprout: (
    <svg {...svgProps}>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5Z" />
    </svg>
  ),
  userPlus: (
    <svg {...svgProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  ),
  upload: (
    <svg {...svgProps}>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  ),
  search: (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  ),
  bag: (
    <svg {...svgProps}>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
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
};

function Icon({ name }) {
  return <span className="lp-icon">{ICONS[name]}</span>;
}

const PURPOSES = [
  {
    icon: 'expand',
    title: 'Expand Market Access',
    text: 'Help local farmers reach more potential buyers through an online marketplace.',
  },
  {
    icon: 'link',
    title: 'Connect Farmers and Buyers',
    text: 'Provide a platform where farmers and buyers can communicate and establish direct connections.',
  },
  {
    icon: 'scale',
    title: 'Promote Fair Opportunities',
    text: 'Give farmers an opportunity to showcase their products and set their own prices.',
  },
  {
    icon: 'sprout',
    title: 'Support Local Agriculture',
    text: 'Encourage the accessibility and promotion of locally produced agricultural goods.',
  },
];

const PROCESS = [
  {
    icon: 'userPlus',
    title: 'Register',
    text: 'Farmers register and create their profiles.',
  },
  {
    icon: 'upload',
    title: 'List Products',
    text: 'Farmers upload their available agricultural products.',
  },
  {
    icon: 'search',
    title: 'Discover',
    text: 'Buyers browse and discover listed products.',
  },
  {
    icon: 'bag',
    title: 'Order',
    text: 'Buyers connect with farmers and submit orders.',
  },
];

export default function About() {
  return (
    <div className="landing about">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link to="/" className="lp-logo">
            <span className="lp-logo-mark">
              <Icon name="leaf" />
            </span>
            FarmConnect
          </Link>

          <nav className="lp-links" aria-label="Main">
            <Link to="/">Home</Link>
            <Link to="/about" className="active">About Us</Link>
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
        {/* ---------- 1. PAGE HERO ---------- */}
        <section className="ab-hero">
          <div className="lp-wrap ab-hero-grid">
            <div className="lp-rise">
              <span className="lp-eyebrow">About FarmConnect</span>
              <h1>
                Growing Connections, <span>Empowering Local Farmers.</span>
              </h1>
              <p>
                FarmConnect is a digital marketplace designed to connect local
                farmers with buyers, creating better opportunities for
                agricultural products to reach the market.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- 2. WHO WE ARE ---------- */}
        <section className="lp-section">
          <div className="lp-wrap ab-two-col">
            <div className="ab-media lp-reveal">
              <img
                src="/landing-about.jpg"
                alt="Fresh produce harvested from a local farm"
              />
            </div>

            <div className="ab-copy lp-reveal">
              <span className="lp-eyebrow">Who we are</span>
              <h2>Who We Are</h2>
              <p>
                FarmConnect is a web-based agricultural marketplace that aims to
                address the limited market access experienced by local farmers.
              </p>
              <p>
                The platform provides a convenient online space where farmers can
                showcase their agricultural products and connect with potential
                buyers.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- 3. MISSION AND VISION ---------- */}
        <section className="lp-section lp-section-white">
          <div className="lp-wrap">
            <div className="lp-section-head lp-reveal">
              <span className="lp-eyebrow">Our direction</span>
              <h2>Mission and Vision</h2>
            </div>

            <div className="ab-mv-grid lp-reveal">
              <article className="ab-card">
                <div className="lp-icon-wrap">
                  <Icon name="target" />
                </div>
                <p className="ab-card-label">Our Mission</p>
                <h3>Open the market to every local farmer</h3>
                <p>
                  To provide local farmers with an accessible digital platform
                  that helps expand their market reach, connect with buyers, and
                  create better opportunities for selling their agricultural
                  products.
                </p>
              </article>

              <article className="ab-card">
                <div className="lp-icon-wrap">
                  <Icon name="eye" />
                </div>
                <p className="ab-card-label">Our Vision</p>
                <h3>A trusted marketplace for local agriculture</h3>
                <p>
                  To become a reliable digital marketplace that strengthens
                  connections between local farmers and buyers while supporting
                  the growth and accessibility of local agriculture.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- 4. OUR PURPOSE ---------- */}
        <section className="lp-section">
          <div className="lp-wrap">
            <div className="lp-section-head lp-reveal">
              <span className="lp-eyebrow">What we aim to achieve</span>
              <h2>Our Purpose</h2>
            </div>

            <div className="lp-feature-grid lp-reveal">
              {PURPOSES.map((p) => (
                <article className="lp-feature" key={p.title}>
                  <div className="lp-icon-wrap">
                    <Icon name={p.icon} />
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- 5. HOW FARMCONNECT WORKS ---------- */}
        <section className="lp-section lp-section-white">
          <div className="lp-wrap">
            <div className="lp-section-head lp-reveal">
              <span className="lp-eyebrow">How it works</span>
              <h2>How FarmConnect Works</h2>
            </div>

            <div className="lp-steps ab-steps lp-reveal">
              {PROCESS.map((s, i) => (
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

        {/* ---------- 6. OUR COMMITMENT ---------- */}
        <section className="lp-section">
          <div className="lp-wrap">
            <div className="ab-commit lp-reveal">
              <img
                src="/landing-farmer.jpg"
                alt="A farmer caring for crops in the field"
              />
              <div className="ab-commit-copy">
                <span className="lp-eyebrow ab-eyebrow-light">Our commitment</span>
                <h2>Supporting the People Behind Every Harvest.</h2>
                <p>
                  Behind every agricultural product is a farmer who works hard to
                  bring fresh produce to the market. FarmConnect aims to make
                  those products more accessible by creating a digital connection
                  between farmers and buyers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- 7. CALL TO ACTION ---------- */}
        <section className="lp-cta">
          <div className="lp-wrap">
            <div className="lp-cta-box lp-reveal">
              <h2>Be Part of a Better Agricultural Marketplace.</h2>
              <p>
                Whether you are a local farmer or a buyer, FarmConnect provides an
                opportunity to connect and support local agriculture.
              </p>
              <div className="lp-cta-row lp-cta-center">
                <Link to="/marketplace" className="lp-btn lp-btn-light">
                  Explore Marketplace
                </Link>
                <Link to="/register" className="lp-btn lp-btn-ghost-light">
                  Join FarmConnect
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- 8. FOOTER ---------- */}
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
              <h4>Quick Links</h4>
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