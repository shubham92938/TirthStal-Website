import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiHeart, FiBell, FiMapPin, FiStar } from "react-icons/fi";
import "../../styles/pages/authShell.css";

const COPY = {
  login:  { eyebrow: "Welcome back", head: "Your sacred journey continues", features: null },
  signup: {
    eyebrow: "Join Tirthstal",
    head: "Begin your sacred journey",
    features: [
      { icon: <FiHeart />,  text: "Save the temples you love" },
      { icon: <FiBell />,   text: "Never miss a festival" },
      { icon: <FiMapPin />, text: "Plan visits across the state" },
    ],
  },
  recover: { eyebrow: "Account recovery", head: "We'll get you back in", features: null },
};

const QUOTES = [
  { t: "Ujjain's Mahakaleshwar is the only south-facing Jyotirlinga.", s: "Did you know?" },
  { t: "Khajuraho's temples were built between 950 and 1050 CE.", s: "Heritage" },
  { t: "Omkareshwar sits on an island shaped like the sacred Om.", s: "Sacred geography" },
  { t: "Simhastha Kumbh returns to Ujjain every 12 years.", s: "Festival" },
];

/**
 * Shared shell for login / signup / forgot / reset.
 *  - desktop: animated ember panel on the left, form on the right
 *  - mobile : compact brand banner on top, form card overlaps it
 */
export default function AuthLayout({ variant = "login", title, subtitle, children, footer }) {
  const copy = COPY[variant] || COPY.login;
  const [q, setQ] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setQ((i) => (i + 1) % QUOTES.length), 4800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ax">
      {/* ── Brand panel ── */}
      <aside className="ax-brand">
        <div className="ax-brand__bg" />
        <div className="ax-mandala" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        {Array.from({ length: 14 }).map((_, i) => (
          <i key={i} className="ax-ember" style={{ "--x": `${(i * 37) % 100}%`, "--d": `${(i % 7) * 1.1}s`, "--s": `${4 + (i % 5)}s` }} />
        ))}

        <div className="ax-brand__top">
          <Link to="/" className="ax-logo">
            <span className="ax-logo__mark">🛕</span>
            <span><b>Tirthstal</b><small>Sacred temples, divine journey</small></span>
          </Link>
        </div>

        <div className="ax-brand__mid">
          <span className="ax-brand__eyebrow">{copy.eyebrow}</span>
          <h2>{copy.head}</h2>

          {copy.features && (
            <ul className="ax-features">
              {copy.features.map((f) => (
                <li key={f.text}><span>{f.icon}</span>{f.text}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="ax-brand__bottom">
          <div className="ax-quote">
            <AnimatePresence mode="wait">
              <motion.div key={q} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45 }}>
                <small><FiStar size={11} /> {QUOTES[q].s}</small>
                <p>{QUOTES[q].t}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ── Form side ── */}
      <main className="ax-main">
        <Link to="/" className="ax-back"><FiArrowLeft size={15} /> Back to home</Link>

        <motion.div className="ax-card" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="ax-card__head">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="ax-card__foot">{footer}</div>}
        </motion.div>

        <p className="ax-legal">
          By continuing you agree to our <Link to="/legal/terms">Terms</Link> &amp; <Link to="/legal/privacy">Privacy Policy</Link>.
        </p>
      </main>
    </div>
  );
}
