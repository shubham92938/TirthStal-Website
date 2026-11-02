import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { SITE, SOCIALS } from "../../config/site";
import { subscribeNewsletter, isEmail } from "../../services/outreachService";
import { FiHeart, FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from "react-icons/fi";
import { motion } from "framer-motion";
import "../../styles/common/footer.css";

const quickLinks = [
  { label: "Home",       path: "/" },
  { label: "Temples",    path: "/temples" },
  { label: "Districts",  path: "/districts" },
  { label: "Festivals",  path: "/festivals" },
  { label: "Goseva",     path: "/goseva" },
  { label: "Temple Map", path: "/map" },
  { label: "Blog",       path: "/blog" },
];

const exploreLinks = [
  { label: "Shiva Temples",   path: "/temples?deity=Shiva" },
  { label: "Vishnu Temples",  path: "/temples?deity=Vishnu" },
  { label: "Devi Temples",    path: "/temples?deity=Devi" },
  { label: "Jyotirlingas",    path: "/temples?type=Jyotirlinga" },
  { label: "Hanuman Temples", path: "/temples?deity=Hanuman" },
  { label: "Ganesh Temples",  path: "/temples?deity=Ganesh" },
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

      {/* ── Top Section ── */}
      <div className="footer__top">

        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <img
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
          <p className="footer__desc">
            Discover and explore thousands of sacred temples across India.
            Your one-stop destination for divine journeys and spiritual experiences.
          </p>

          {/* Socials */}
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

        {/* Quick Links */}
        <div className="footer__col">
          <h4 className="footer__col-title">Quick Links</h4>
          <ul className="footer__links">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.path} className="footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <div className="footer__col">
          <h4 className="footer__col-title">Explore</h4>
          <ul className="footer__links">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.path} className="footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4 className="footer__col-title">Contact Us</h4>
          <ul className="footer__contact-list">
            <li>
              <FiMail size={15} className="footer__contact-icon" />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <FiPhone size={15} className="footer__contact-icon" />
              <a href={`tel:${SITE.mobile.replace(/\s/g, "")}`}>{SITE.mobile}</a>
            </li>
            <li>
              <FiMapPin size={15} className="footer__contact-icon" />
              <span>Indore, Madhya Pradesh, India</span>
            </li>
          </ul>

          {/* Newsletter */}
          <div className="footer__newsletter">
            <p className="footer__newsletter-label">Subscribe to our newsletter</p>
            <form className="footer__newsletter-input" onSubmit={onSubscribe} noValidate>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button type="submit" disabled={busy}>{busy ? "…" : "Subscribe"}</button>
            </form>
          </div>
        </div>

      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer__bottom">
        <p className="footer__copy">
          © {new Date().getFullYear()} Tirthstal. All rights reserved. Made with
          <FiHeart size={13} className="footer__heart" />
          for devotees.
        </p>
        <div className="footer__bottom-links">
          <Link to="/legal/privacy">Privacy Policy</Link>
          <Link to="/legal/terms">Terms of Service</Link>
          <Link to="/legal/sitemap">Sitemap</Link>
        </div>
      </div>

    </footer>
  );
}
