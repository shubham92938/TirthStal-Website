import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMapPin, FiHeart, FiStar, FiArrowUpRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useFavorites } from "../../context/FavoritesContext";
import { FALLBACK_IMAGE } from "../../data/store";
import "../../styles/temple/templeCard.css";

export default function TempleCard({ temple, index = 0 }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(temple.id);

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id:         temple.id,
      name:       temple.name,
      image:      temple.images?.[0] || FALLBACK_IMAGE,
      location:   `${temple.district}, ${temple.state}`,
      deity:      temple.deity,
      deityColor: temple.deityColor,
      rating:     temple.rating,
      slug:       temple.slug,
      type:       "temple",
    });
    toast.success(fav ? "Removed from favorites" : `Saved ${temple.name}`, {
      icon: fav ? "💔" : "🧡",
    });
  };

  return (
    <motion.article
      className="tcard"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      style={{ "--accent": temple.deityColor || "#c8610a" }}
    >
      <div className="tcard__img-wrap">
        <Link to={`/temples/${temple.slug}`} className="tcard__img-link" aria-label={`View ${temple.name}`} tabIndex={-1}>
          <img
            src={temple.images?.[0] || FALLBACK_IMAGE}
            alt={temple.name}
            className="tcard__img"
            loading="lazy"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
          />
        </Link>
        <div className="tcard__veil" />

        <button
          type="button"
          className={`tcard__fav ${fav ? "active" : ""}`}
          onClick={handleFav}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <FiHeart size={15} />
        </button>

        {temple.type && <span className="tcard__type">{temple.type}</span>}
      </div>

      <Link to={`/temples/${temple.slug}`} className="tcard__info">
        <h3 className="tcard__name">{temple.name}</h3>
        <div className="tcard__location">
          <FiMapPin size={12} />
          <span>{temple.district}, {temple.state}</span>
        </div>
        <div className="tcard__bottom">
          <div className="tcard__rating">
            <FiStar size={12} className="tcard__star" />
            <span>{temple.rating}</span>
            <span className="tcard__reviews">({temple.reviews?.toLocaleString("en-IN")})</span>
          </div>
          <span
            className="tcard__deity"
            style={{ background: `${temple.deityColor}18`, color: temple.deityColor }}
          >
            {temple.shortDeity}
          </span>
        </div>
        <span className="tcard__cta">
          Explore temple <FiArrowUpRight size={14} />
        </span>
      </Link>
    </motion.article>
  );
}
