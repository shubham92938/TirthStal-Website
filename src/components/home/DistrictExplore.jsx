import { motion } from "framer-motion";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState } from "react";
import { districts } from "../../data/districts";
import { getTemplesByDistrictName } from "../../data/store";
import { districtImages } from "../../data/templeImages";
import "../../styles/home/districtExplore.css";

export default function DistrictExplore() {
  const [visibleCards, setVisibleCards] = useState(8);

  return (
    <section className="district">

      {/* ── Header ── */}
      <div className="district__header">
        <div>
          <span className="section-eyebrow">Wander the heartland</span>
          <h2 className="district__title">Explore by District</h2>
        </div>
        <Link to="/districts" className="district__view-all">
          View All Districts <FiArrowRight size={15} />
        </Link>
      </div>

      {/* ── Grid ── */}
      <div className="district__grid">
        {districts.slice(0, visibleCards).map((district, i) => (
          <motion.div
            key={district.name}
            className="district__card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ y: -5 }}
          >
            <Link to={`/districts/${district.slug}`} className="district__card-link">
              <div className="district__img-wrap">
                <img
                  src={district.image}
                  alt={district.name}
                  className="district__img"
                  loading="lazy"
                  onError={(e) => {
                    const el = e.currentTarget;
                    const alt = districtImages[district.slug];
                    if (alt && el.src !== alt) el.src = alt;
                    else { el.onerror = null; el.src = "/images/placeholder-temple.jpg"; }
                  }}
                />
                <div className="district__overlay" />
                <div className="district__text">
                  <span className="district__name">
                    <FiMapPin size={13} />
                    {district.name}
                  </span>
                  <span className="district__count">
                    {(() => { const n = getTemplesByDistrictName(district.name).length; return n ? `${n} Temple${n > 1 ? "s" : ""}` : "District guide"; })()}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {visibleCards < districts.length && (
        <div className="district__load-more">
          <button onClick={() => setVisibleCards((prev) => prev + 8)}>
            Load More Districts <FiArrowRight size={14} />
          </button>
        </div>
      )}

    </section>
  );
}