import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiStar, FiMapPin } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import SearchBar from "../common/SearchBar";
import { allTemples } from "../../data/store";
import "../../styles/home/hero.css";

// Every tag maps to a real, working filter on /temples
const popularSearches = [
  { label: "Shiva Temples",   to: "/temples?deity=Shiva" },
  { label: "Vishnu Temples",  to: "/temples?deity=Vishnu" },
  { label: "Devi Temples",    to: "/temples?deity=Devi" },
  { label: "Jyotirlingas",    to: "/temples?type=Jyotirlinga" },
  { label: "Ganesh Temples",  to: "/temples?deity=Ganesh" },
];

// Deterministic "embers" so the render is pure
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left:  `${(i * 47) % 100}%`,
  size:  4 + ((i * 7) % 7),
  delay: `${(i * 0.9) % 9}s`,
  dur:   `${9 + ((i * 5) % 8)}s`,
  dx:    `${((i * 29) % 80) - 40}px`,
}));

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const featured = useMemo(
    () => allTemples.find((x) => x.slug === "mahakaleshwar-temple") || allTemples[0],
    []
  );

  return (
    <section className="hero">
      <div className="hero__media" aria-hidden="true">
      <img
        src="/images/hero-temples.jpeg"
        alt=""
        className="hero__bg"
        fetchPriority="high"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/hero-temple.jpg"; }}
      />
      <div className="hero__overlay" />
      <div className="hero__mandala" aria-hidden="true" />

      <div className="hero__embers" aria-hidden="true">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            style={{
              left: e.left, width: e.size, height: e.size,
              animationDelay: e.delay, animationDuration: e.dur, "--dx": e.dx,
            }}
          />
        ))}
      </div>
      </div>

      <div className="hero__inner">
        <div className="hero__content">
          <motion.div
            className="hero__badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="hero__badge-dot" />
            <span>{t("hero.badge")}</span>
          </motion.div>

          <motion.h1
            className="hero__heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t("hero.heading1")} <br />
            <span className="hero__heading-orange">{t("hero.heading2")}</span> {t("hero.heading3")}
          </motion.h1>

          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            {t("hero.sub1")} <br />
            {t("hero.sub2")}
          </motion.p>

          <motion.div
            className="hero__search"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <SearchBar placeholder={t("hero.searchBtn")} />
          </motion.div>

          <motion.div
            className="hero__popular"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="hero__popular-label">{t("hero.popular")}</span>
            <div className="hero__popular-tags">
              {popularSearches.map((tag) => (
                <button
                  type="button"
                  key={tag.label}
                  className="hero__popular-tag"
                  onClick={() => navigate(tag.to)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating featured temple card */}
        {featured && (
          <motion.div
            className="hero__feature"
            initial={{ opacity: 0, x: 60, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={`/temples/${featured.slug}`} className="hero__feature-card">
              <div className="hero__feature-img">
                <img src={featured.images[0]} alt={featured.name} />
                <span className="hero__feature-tag">✦ Featured</span>
              </div>
              <div className="hero__feature-body">
                <h3>{featured.name}</h3>
                <p><FiMapPin size={12} /> {featured.district}, {featured.state}</p>
                <div className="hero__feature-row">
                  <span className="hero__feature-rating"><FiStar size={13} /> {featured.rating}</span>
                  <span className="hero__feature-go">Explore <FiArrowRight size={14} /></span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      <div className="hero__wave" aria-hidden="true" />
    </section>
  );
}
