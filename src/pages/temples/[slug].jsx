import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "leaflet/dist/leaflet.css";
import {
  FiHome, FiChevronRight, FiMapPin, FiClock, FiHeart, FiShare2,
  FiNavigation, FiGlobe, FiStar, FiSun, FiMoon, FiCheckCircle, FiArrowRight, FiMaximize2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { getTempleBySlug, getNearbyTemples, FALLBACK_IMAGE } from "../../data/store";
import { allFestivals } from "../../data/festivalStore";
import { useFavorites } from "../../context/FavoritesContext";
import "../../styles/temple/templeDetail.css";

const tabs = ["Overview", "Aarti & Timings", "Gallery", "Location", "Festivals", "Nearby"];

const humanise = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();

const pin = L.divIcon({
  className: "",
  html: `<div style="width:38px;height:38px;background:linear-gradient(135deg,#ff9a2e,#c8610a);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:15px">🛕</span></div>`,
  iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38],
});

// Find a festival page that matches a festival name written on a temple
const findFestival = (name) => {
  const n = name.toLowerCase();
  const first = n.split(" ")[0];
  return allFestivals.find((f) => {
    const fn = f.name.toLowerCase();
    return fn.includes(n) || n.includes(fn) || (first.length >= 5 && fn.includes(first));
  });
};

// key on slug so tab / carousel state resets when moving temple → temple
export default function TempleDetailPage() {
  const { slug } = useParams();
  return <TempleDetail key={slug} slug={slug} />;
}

function TempleDetail({ slug }) {
  const temple = useMemo(() => getTempleBySlug(slug), [slug]);
  const { isFavorite, toggleFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState("Overview");
  const [imgIndex, setImgIndex]   = useState(0);
  const [lightbox, setLightbox]   = useState(-1);


  const nearby = useMemo(() => (temple ? getNearbyTemples(temple, 4) : []), [temple]);

  if (!temple) {
    return (
      <div className="temple-detail__not-found">
        <span>🛕</span>
        <h2>Temple not found</h2>
        <p>We couldn’t find a temple at this address.</p>
        <Link to="/temples">Back to Temples</Link>
      </div>
    );
  }

  const fav = isFavorite(temple.id);
  const images = temple.images;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${temple.coordinates.lat},${temple.coordinates.lng}`;
  const dirUrl  = `https://www.google.com/maps/dir/?api=1&destination=${temple.coordinates.lat},${temple.coordinates.lng}`;

  const onFav = () => {
    toggleFavorite({
      id: temple.id, name: temple.name, image: images[0],
      location: `${temple.district}, ${temple.state}`, deity: temple.deity,
      deityColor: temple.deityColor, rating: temple.rating, slug: temple.slug, type: "temple",
    });
    toast.success(fav ? "Removed from favorites" : `Saved ${temple.name}`, { icon: fav ? "💔" : "🧡" });
  };

  const onShare = async () => {
    const url = window.location.href;
    const data = { title: temple.name, text: `Explore ${temple.name} on Tirthstal`, url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (err) {
      if (err?.name !== "AbortError") toast.error("Couldn’t share — copy the link from the address bar");
    }
  };

  return (
    <div className="temple-detail">

      {/* ── Breadcrumb ── */}
      <div className="temple-detail__breadcrumb">
        <Link to="/" className="breadcrumb__item"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} className="breadcrumb__sep" />
        <Link to="/temples" className="breadcrumb__item">Temples</Link>
        <FiChevronRight size={13} className="breadcrumb__sep" />
        <Link to={`/temples?state=${encodeURIComponent(temple.state)}`} className="breadcrumb__item">{temple.state}</Link>
        <FiChevronRight size={13} className="breadcrumb__sep" />
        <span className="breadcrumb__item breadcrumb__item--active">{temple.name}</span>
      </div>

      {/* ── Hero ── */}
      <div className="temple-detail__hero">
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIndex}
            src={images[imgIndex]}
            alt={temple.name}
            className="temple-detail__hero-img"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
          />
        </AnimatePresence>
        <div className="temple-detail__hero-overlay" />

        <div className="temple-detail__hero-actions">
          <button type="button" className={`temple-detail__fav-btn ${fav ? "active" : ""}`} onClick={onFav} aria-pressed={fav}>
            <FiHeart size={17} />
            {fav ? "Saved" : "Save"}
          </button>
          <button type="button" className="temple-detail__share-btn" onClick={onShare}>
            <FiShare2 size={17} />
            Share
          </button>
          <button type="button" className="temple-detail__share-btn" onClick={() => setLightbox(imgIndex)} aria-label="View full screen">
            <FiMaximize2 size={17} />
          </button>
        </div>

        {images.length > 1 && (
          <div className="temple-detail__thumbnails">
            {images.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`${temple.name} view ${i + 1}`}
                className={`temple-detail__thumb ${i === imgIndex ? "active" : ""}`}
                onClick={() => setImgIndex(i)}
              />
            ))}
          </div>
        )}

        <div className="temple-detail__hero-badge">
          <span className="temple-detail__deity-tag" style={{ "--c": temple.deityColor }}>
            🕉️ {temple.deity}
          </span>
          {temple.type && <span className="temple-detail__deity-tag temple-detail__deity-tag--type">{temple.type}</span>}
        </div>
      </div>

      {/* ── Title ── */}
      <motion.div
        className="temple-detail__title-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="temple-detail__title">{temple.name}</h1>
        <div className="temple-detail__meta">
          <span className="temple-detail__location"><FiMapPin size={15} />{temple.address}, {temple.state}</span>
          <span className="temple-detail__timing"><FiClock size={15} />{temple.timings?.morning}</span>
          <span className="temple-detail__rating"><FiStar size={14} /> {temple.rating} <em>({temple.reviews.toLocaleString("en-IN")} reviews)</em></span>
        </div>
      </motion.div>

      {/* ── Main Content ── */}
      <div className="temple-detail__body">
        <div className="temple-detail__left">

          {/* Tabs */}
          <div className="temple-detail__tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`temple-detail__tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <motion.div
            key={activeTab}
            className="temple-detail__tab-content"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview */}
            {activeTab === "Overview" && (
              <div className="temple-detail__overview">
                <h3>About the Temple</h3>
                <p>{temple.description}</p>
                <h3>History</h3>
                <p>{temple.history}</p>

                <div className="temple-detail__info-cards">
                  <div className="temple-detail__info-card">
                    <FiSun size={20} className="info-card__icon" />
                    <span className="info-card__label">Morning</span>
                    <span className="info-card__value">{temple.timings?.morning}</span>
                  </div>
                  <div className="temple-detail__info-card">
                    <FiMoon size={20} className="info-card__icon" />
                    <span className="info-card__label">Evening</span>
                    <span className="info-card__value">{temple.timings?.evening}</span>
                  </div>
                  <div className="temple-detail__info-card">
                    <FiStar size={20} className="info-card__icon" />
                    <span className="info-card__label">Rating</span>
                    <span className="info-card__value">{temple.rating} / 5</span>
                  </div>
                  <div className="temple-detail__info-card">
                    <FiMapPin size={20} className="info-card__icon" />
                    <span className="info-card__label">District</span>
                    <span className="info-card__value">{temple.district}</span>
                  </div>
                </div>

                {temple.facilities?.length > 0 && (
                  <>
                    <h3>Facilities</h3>
                    <div className="temple-detail__chips">
                      {temple.facilities.map((f) => (
                        <span key={f} className="temple-detail__chip"><FiCheckCircle size={14} /> {f}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Aarti & timings */}
            {activeTab === "Aarti & Timings" && (
              <div className="temple-detail__overview">
                <h3>Darshan Timings</h3>
                <div className="temple-detail__aarti">
                  <div className="temple-detail__aarti-row"><FiSun /> <span>Morning</span><strong>{temple.timings?.morning}</strong></div>
                  <div className="temple-detail__aarti-row"><FiMoon /> <span>Evening</span><strong>{temple.timings?.evening}</strong></div>
                </div>
                {temple.aartiTimings && (
                  <>
                    <h3>Aarti Schedule</h3>
                    <div className="temple-detail__aarti">
                      {Object.entries(temple.aartiTimings).map(([k, v]) => (
                        <div key={k} className="temple-detail__aarti-row">🪔 <span>{humanise(k)}</span><strong>{v}</strong></div>
                      ))}
                    </div>
                  </>
                )}
                <p className="temple-detail__note">Timings can change on festivals and special days — please confirm with the temple before travelling.</p>
              </div>
            )}

            {/* Gallery */}
            {activeTab === "Gallery" && (
              <div className="temple-detail__gallery">
                {images.map((img, i) => (
                  <motion.button
                    type="button"
                    key={img}
                    className="temple-detail__gallery-btn"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setLightbox(i)}
                    aria-label={`Open photo ${i + 1}`}
                  >
                    <img src={img} alt={`${temple.name} ${i + 1}`} className="temple-detail__gallery-img" loading="lazy" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Location */}
            {activeTab === "Location" && (
              <div className="temple-detail__location-tab">
                <div className="temple-detail__map">
                  <MapContainer
                    center={[temple.coordinates.lat, temple.coordinates.lng]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <Marker position={[temple.coordinates.lat, temple.coordinates.lng]} icon={pin}>
                      <Popup><strong>{temple.name}</strong><br />{temple.address}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="temple-detail__address-card">
                  <h4>Address</h4>
                  <p>{temple.address}, {temple.district}, {temple.state}</p>
                  <div className="temple-detail__address-actions">
                    <a href={dirUrl} target="_blank" rel="noreferrer" className="temple-detail__maps-btn">
                      <FiNavigation size={15} /> Get Directions
                    </a>
                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="temple-detail__maps-btn temple-detail__maps-btn--ghost">
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Festivals */}
            {activeTab === "Festivals" && (
              <div className="temple-detail__festivals">
                {(temple.festivals || []).map((name) => {
                  const match = findFestival(name);
                  const Wrapper = match ? Link : "div";
                  return (
                    <Wrapper
                      key={name}
                      {...(match ? { to: `/festivals/${match.slug}` } : {})}
                      className="temple-detail__festival-card"
                    >
                      <div className="festival-card__month">{match ? match.month.split("/")[0] : "Festival"}</div>
                      <div className="festival-card__info">
                        <h4>{name}</h4>
                        <p>{match ? match.duration : "Celebrated here with special rituals and aarti."}</p>
                      </div>
                      {match && <FiArrowRight className="festival-card__go" />}
                    </Wrapper>
                  );
                })}
              </div>
            )}

            {/* Nearby */}
            {activeTab === "Nearby" && (
              <div className="temple-detail__nearby">
                <p className="temple-detail__nearby-sub">Closest temples to {temple.name}</p>
                <div className="temple-detail__nearby-grid">
                  {nearby.map((t) => (
                    <Link key={t.id} to={`/temples/${t.slug}`} className="temple-detail__nearby-card">
                      <img src={t.images[0]} alt={t.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
                      <div>
                        <p className="nearby-card__name">{t.name}</p>
                        <p className="nearby-card__dist"><FiMapPin size={11} /> {t.distance.toLocaleString("en-IN")} km away · {t.district}</p>
                      </div>
                      <FiArrowRight className="festival-card__go" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="temple-detail__sidebar">
          <div className="temple-detail__sidebar-card">
            <h4 className="sidebar-card__title">Plan your visit</h4>
            <ul className="sidebar-card__list">
              <li><FiMapPin size={14} /><span>{temple.address}</span></li>
              <li><FiSun size={14} /><span>{temple.timings?.morning}</span></li>
              <li><FiMoon size={14} /><span>{temple.timings?.evening}</span></li>
            </ul>
            <a href={dirUrl} target="_blank" rel="noreferrer" className="sidebar-card__directions-btn">
              <FiNavigation size={14} /> Get Directions
            </a>
            {temple.officialWebsite && (
              <a href={temple.officialWebsite} target="_blank" rel="noreferrer" className="sidebar-card__web-btn">
                <FiGlobe size={14} /> Official Website
              </a>
            )}
          </div>

          <div className="temple-detail__sidebar-card">
            <h4 className="sidebar-card__title">Quick facts</h4>
            <ul className="sidebar-card__info-list">
              <li><span className="info-list__label">Deity</span><span className="info-list__value">{temple.deity}</span></li>
              <li><span className="info-list__label">Type</span><span className="info-list__value">{temple.type}</span></li>
              <li><span className="info-list__label">District</span><span className="info-list__value">{temple.district}</span></li>
              <li><span className="info-list__label">State</span><span className="info-list__value">{temple.state}</span></li>
            </ul>
            <Link to={`/temples?district=${encodeURIComponent(temple.district)}`} className="sidebar-card__link">More temples in {temple.district} <FiArrowRight size={13} /></Link>
          </div>
        </div>
      </div>

      <Lightbox
        open={lightbox >= 0}
        index={Math.max(lightbox, 0)}
        close={() => setLightbox(-1)}
        slides={images.map((src) => ({ src }))}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
