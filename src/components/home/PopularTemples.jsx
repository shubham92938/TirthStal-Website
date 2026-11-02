import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiArrowLeft, FiMapPin, FiHeart, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { useFavorites } from "../../context/FavoritesContext";
import { allTemples, sortTemples, FALLBACK_IMAGE } from "../../data/store";
import "../../styles/home/popularTemples.css";

export default function PopularTemples() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const scroller = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const temples = useMemo(() => sortTemples(allTemples, "Popularity").slice(0, 10), []);

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 260), behavior: "smooth" });
  };

  const onFav = (e, temple) => {
    e.preventDefault();
    e.stopPropagation();
    const was = isFavorite(temple.id);
    toggleFavorite({
      id: temple.id, name: temple.name, image: temple.images[0],
      location: `${temple.district}, ${temple.state}`, deity: temple.deity,
      deityColor: temple.deityColor, rating: temple.rating, slug: temple.slug, type: "temple",
    });
    toast.success(was ? "Removed from favorites" : `Saved ${temple.name}`, { icon: was ? "💔" : "🧡" });
  };

  return (
    <section className="popular">
      <div className="popular__header">
        <div>
          <span className="section-eyebrow">Most loved</span>
          <h2 className="popular__title">Popular Temples</h2>
        </div>
        <div className="popular__controls">
          <button type="button" className="popular__nav" onClick={() => scrollBy(-1)} disabled={edge.start} aria-label="Scroll left"><FiArrowLeft size={18} /></button>
          <button type="button" className="popular__nav" onClick={() => scrollBy(1)} disabled={edge.end} aria-label="Scroll right"><FiArrowRight size={18} /></button>
          <Link to="/temples" className="popular__view-all">
            View All Temples <FiArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="popular__grid" ref={scroller} onScroll={updateEdges}>
        {temples.map((temple, i) => {
          const fav = isFavorite(temple.id);
          return (
            <motion.div
              key={temple.id}
              className="popular__card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.06 }}
              whileHover={{ y: -8 }}
            >
              <div className="popular__img-wrap">
                <Link to={`/temples/${temple.slug}`} tabIndex={-1} aria-label={temple.name}>
                  <img
                    src={temple.images[0]}
                    alt={temple.name}
                    className="popular__img"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                  />
                </Link>
                <div className="popular__veil" />
                <button
                  type="button"
                  className={`popular__fav ${fav ? "active" : ""}`}
                  onClick={(e) => onFav(e, temple)}
                  aria-pressed={fav}
                  aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                >
                  <FiHeart size={15} />
                </button>
                <span className="popular__rating"><FiStar size={12} /> {temple.rating}</span>
              </div>

              <Link to={`/temples/${temple.slug}`} className="popular__info">
                <h3 className="popular__name">{temple.name}</h3>
                <div className="popular__bottom">
                  <span className="popular__city"><FiMapPin size={12} />{temple.district}</span>
                  <span
                    className="popular__deity"
                    style={{ background: `${temple.deityColor}18`, color: temple.deityColor }}
                  >
                    {temple.shortDeity}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
