import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { SITE, SOCIALS } from "../../config/site";
import { subscribeNewsletter, isEmail } from "../../services/outreachService";
import { FiHeart, FiMail, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from "react-icons/fi";
import { motion } from "framer-motion";
import "../../styles/common/footer.css";

const quickLinks = [
  { label: "Temples",   path: "/temples" },
  { label: "Festivals", path: "/festivals" },
  { label: "Goseva",    path: "/goseva" },
  { label: "Blog",      path: "/blog" },
];

const exploreLinks = [
  { label: "Shiva Temples",  path: "/temples?deity=Shiva" },
  { label: "Vishnu Temples", path: "/temples?deity=Vishnu" },
  { label: "Devi Temples",   path: "/temples?deity=Devi" },
  { label: "Jyotirlingas",   path: "/temples?type=Jyotirlinga" },
];

const socials = [
  { icon: <FiInstagram size={18} />, path: SOCIALS.instagram, label: "Instagram" },
  { icon: <FiFacebook  size={18} />, path: SOCIALS.facebook,  label: "Facebook"  },
  { icon: <FiTwitter   size={18} />, path: SOCIALS.twitter,   label: "Twitter"   },
  { icon: <FiYoutube   size={18} />, path: SOCIALS.youtube,   label: "YouTube"   },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy,  setBusy]  = useState(false);

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) { toast.error("Please enter a valid email address"); return; }
    setBusy(true);
    try {
      const { delivered } = await subscribeNewsletter(email.trim());
      toast.success(delivered ? "Subscribed! Jai Shri Ram 🙏" : "Thanks! We’ve noted your email 🙏");
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer__top">

        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <img loading="lazy" decoding="async"
              src="/icons/temple-logo.jpg"
              alt="Tirthstal"
              className="footer__logo-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div>
              <p className="footer__logo-name">Tirthstal</p>
              <p className="footer__logo-sub">Sacred Temples, Divine Journey</p>
            </div>
          </Link>
          <div className="footer__socials">
            {socials.map((s) => (
              <motion.a
                key={s.label}
                href={s.path}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-btn"
                aria-label={s.label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="footer__col">
          <h4 className="footer__col-title">Quick Links</h4>
          <ul className="footer__links">
            {quickLinks.map((link) => (
              <li key={link.label}><Link to={link.path} className="footer__link">{link.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Explore</h4>
          <ul className="footer__links">
            {exploreLinks.map((link) => (
              <li key={link.label}><Link to={link.path} className="footer__link">{link.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer__col footer__newsletter">
          <h4 className="footer__col-title">Stay in the loop</h4>
          <form className="footer__newsletter-input" onSubmit={onSubscribe} noValidate>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button type="submit" disabled={busy}>{busy ? "…" : "Subscribe"}</button>
          </form>
          <a className="footer__mail" href={`mailto:${SITE.email}`}><FiMail size={13} /> {SITE.email}</a>
        </div>

      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © {new Date().getFullYear()} Tirthstal · Made with
          <FiHeart size={12} className="footer__heart" />
          for devotees
        </p>
        <div className="footer__bottom-links">
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/sitemap">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
