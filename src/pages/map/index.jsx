import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiHome, FiChevronRight, FiSearch,
         FiRefreshCw, FiList, FiMapPin, FiNavigation,
         FiHeart, FiX, FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Select from "../../components/common/Select";
import { useFavorites } from "../../context/FavoritesContext";
import { allTemples, getNearbyTemples, deityFamilies, templeTypes, templeStates, FALLBACK_IMAGE } from "../../data/store";
import "../../styles/map/mapPage.css";

const createIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="
    width:36px; height:36px;
    background:${color};
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
    display:flex; align-items:center; justify-content:center;
  ">
    <span style="transform:rotate(45deg); font-size:14px;">🛕</span>
  </div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 36],
  popupAnchor:[0, -36],
});

const categoryOf = (t) => {
  const type = t.type || "";
  if (/jyotirlinga/i.test(type)) return "Jyotirlinga";
  if (/shakti/i.test(type)) return "Shakti Peeth";
  if (/unesco/i.test(type)) return "UNESCO Heritage";
  if (/royal|palace/i.test(type)) return "Royal Palace";
  return "Other";
};

const categoryColors = {
  "Jyotirlinga":     "#f97316",
  "Shakti Peeth":    "#ec4899",
  "UNESCO Heritage": "#8b5cf6",
  "Royal Palace":    "#f59e0b",
  "Other":           "#c8610a",
};

const ALL_STATES = "All States", ALL_DISTRICTS = "All Districts", ALL_TYPES = "All Types", ALL_DEITIES = "All Deities";

const stateOptions = [{ value: ALL_STATES, label: ALL_STATES }, ...templeStates];
const typeOptions  = [{ value: ALL_TYPES, label: ALL_TYPES }, ...templeTypes];
const deityOptions = [{ value: ALL_DEITIES, label: ALL_DEITIES }, ...deityFamilies.filter((d) => d.count > 0).map((d) => d.name)];

const popularFilters = [
  { label: "Jyotirlinga",     color: "#f97316", icon: "🔱", test: (t) => categoryOf(t) === "Jyotirlinga" },
  { label: "Shakti Peeth",    color: "#ec4899", icon: "⚔️", test: (t) => categoryOf(t) === "Shakti Peeth" },
  { label: "UNESCO Heritage", color: "#f59e0b", icon: "🏛️", test: (t) => categoryOf(t) === "UNESCO Heritage" },
  { label: "Vishnu Temples",  color: "#8b5cf6", icon: "🪷", test: (t) => t.family === "Vishnu" },
  { label: "Shiva Temples",   color: "#3b82f6", icon: "🕉️", test: (t) => t.family === "Shiva" },
  { label: "Top Rated",       color: "#10b981", icon: "⭐", test: (t) => t.rating >= 4.7 },
];

// Fits the map to the visible temples and flies to a focused one
function MapController({ points, focus }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.flyTo(points[0], 11, { duration: 0.8 });
    else map.flyToBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 11, duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  useEffect(() => {
    if (focus) map.flyTo(focus, 12, { duration: 1 });
  }, [focus, map]);

  return null;
}

export default function MapPage() {
  const { isFavorite, toggleFavorite } = useFavorites();

  const [search,          setSearch]          = useState("");
  const [selState,        setSelState]        = useState(ALL_STATES);
  const [selDistrict,     setSelDistrict]     = useState(ALL_DISTRICTS);
  const [selType,         setSelType]         = useState(ALL_TYPES);
  const [selDeity,        setSelDeity]        = useState(ALL_DEITIES);
  const [selectedTemple,  setSelectedTemple]  = useState(() => allTemples.find((t) => t.slug === "mahakaleshwar-temple") || allTemples[0]);
  const [flyCenter,       setFlyCenter]       = useState(null);
  const [showList,        setShowList]        = useState(false);
  const [activeFilters,   setActiveFilters]   = useState([]);
  const [filterOpen,      setFilterOpen]      = useState(false);

  // Lock scroll when filter drawer open on mobile
  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  // Districts depend on the chosen state
  const districtOptions = useMemo(() => {
    const pool = selState === ALL_STATES ? allTemples : allTemples.filter((t) => t.state === selState);
    return [{ value: ALL_DISTRICTS, label: ALL_DISTRICTS }, ...[...new Set(pool.map((t) => t.district))].sort()];
  }, [selState]);

  const activeFilterCount =
    (search ? 1 : 0) +
    (selState !== ALL_STATES ? 1 : 0) +
    (selDistrict !== ALL_DISTRICTS ? 1 : 0) +
    (selType !== ALL_TYPES ? 1 : 0) +
    (selDeity !== ALL_DEITIES ? 1 : 0) +
    activeFilters.length;

  // ── Filter logic (popular filters combine with OR, everything else with AND) ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const popular = popularFilters.filter((f) => activeFilters.includes(f.label));
    return allTemples.filter((t) => {
      if (!t.coordinates) return false;
      if (q && ![t.name, t.deity, t.district, t.type].some((x) => x?.toLowerCase().includes(q))) return false;
      if (selState    !== ALL_STATES    && t.state    !== selState)    return false;
      if (selDistrict !== ALL_DISTRICTS && t.district !== selDistrict) return false;
      if (selType     !== ALL_TYPES     && t.type     !== selType)     return false;
      if (selDeity    !== ALL_DEITIES   && t.family   !== selDeity)    return false;
      if (popular.length && !popular.some((f) => f.test(t))) return false;
      return true;
    });
  }, [search, selState, selDistrict, selType, selDeity, activeFilters]);

  const points = useMemo(() => filtered.map((t) => [t.coordinates.lat, t.coordinates.lng]), [filtered]);
  const nearby = useMemo(() => (selectedTemple ? getNearbyTemples(selectedTemple, 3) : []), [selectedTemple]);

  const handleSelectTemple = (temple) => {
    setSelectedTemple(temple);
    if (temple.coordinates) setFlyCenter([temple.coordinates.lat, temple.coordinates.lng]);
  };

  const resetFilters = () => {
    setSearch(""); setSelState(ALL_STATES);
    setSelDistrict(ALL_DISTRICTS);
    setSelType(ALL_TYPES); setSelDeity(ALL_DEITIES);
    setActiveFilters([]);
  };

  const changeState = (v) => { setSelState(v); setSelDistrict(ALL_DISTRICTS); };

  const togglePopularFilter = (label) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const saveSelected = () => {
    const t = selectedTemple;
    const was = isFavorite(t.id);
    toggleFavorite({
      id: t.id, name: t.name, image: t.images?.[0] || FALLBACK_IMAGE,
      location: `${t.district}, ${t.state}`, deity: t.deity, deityColor: t.deityColor,
      rating: t.rating, slug: t.slug, type: "temple",
    });
    toast.success(was ? "Removed from favorites" : `Saved ${t.name}`, { icon: was ? "💔" : "🧡" });
  };

  // Same controls rendered in the desktop sidebar and the mobile drawer
  const filterControls = (
    <>
      <div className="map-filter__section">
        <p className="map-filter__label">Search Temple</p>
        <div className="map-filter__search">
          <input type="text" placeholder="Search temple, deity, district..." value={search}
            onChange={(e) => setSearch(e.target.value)} aria-label="Search temple" />
          <FiSearch size={14} />
        </div>
      </div>
      <div className="map-filter__section">
        <p className="map-filter__label">Select State</p>
        <Select value={selState} options={stateOptions} onChange={changeState} ariaLabel="State" />
      </div>
      <div className="map-filter__section">
        <p className="map-filter__label">Select District</p>
        <Select value={selDistrict} options={districtOptions} onChange={setSelDistrict} ariaLabel="District" />
      </div>
      <div className="map-filter__section">
        <p className="map-filter__label">Temple Type</p>
        <Select value={selType} options={typeOptions} onChange={setSelType} ariaLabel="Temple type" />
      </div>
      <div className="map-filter__section">
        <p className="map-filter__label">Deity</p>
        <Select value={selDeity} options={deityOptions} onChange={setSelDeity} ariaLabel="Deity" />
      </div>
      <div className="map-filter__section">
        <p className="map-filter__label">Popular Filters</p>
        <div className="map-filter__popular">
          {popularFilters.map((f) => (
            <button
              key={f.label}
              type="button"
              className={`map-filter__popular-btn ${activeFilters.includes(f.label) ? "active" : ""}`}
              style={{ "--accent": f.color }}
              onClick={() => togglePopularFilter(f.label)}
              aria-pressed={activeFilters.includes(f.label)}
            >
              <span>{f.icon}</span>{f.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="map-page">

      {/* ── Breadcrumb ── */}
      <div className="map-page__breadcrumb">
        <Link to="/"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} />
        <span>Temple Map</span>
      </div>

      {/* ── Header ── */}
      <div className="map-page__header">
        <div className="map-page__header-left">
          <h1 className="map-page__title">Temple Map</h1>
          <p className="map-page__sub">
            Explore {allTemples.length} temples on the map. Filter by state,<br />
            district, deity or temple type.
          </p>
        </div>
        <div className="map-page__header-img">
          <img src="/images/hero-temples.jpeg" alt="Temples"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      </div>

      {/* ── Mobile Filter Button ── */}
      <div className="map-page__mobile-bar">
        <button
          type="button"
          className="map-page__filter-btn"
          onClick={() => setFilterOpen(true)}
        >
          <FiFilter size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="map-page__filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* ── Main Body ── */}
      <div className="map-page__body">

        {/* ── Left Filters (desktop only) ── */}
        <aside className="map-filter map-filter--desktop">
          <div className="map-filter__top">
            <h3>Filters</h3>
            <button type="button" className="map-filter__reset" onClick={resetFilters}>
              <FiRefreshCw size={13} /> Reset
            </button>
          </div>

          {filterControls}

          <p className="map-filter__result">{filtered.length} temple{filtered.length === 1 ? "" : "s"} on the map</p>
        </aside>

        {/* ── Map ── */}
        <div className="map-page__map-wrap">

          {/* View List toggle */}
          <button
            type="button"
            className="map-page__list-btn"
            onClick={() => setShowList(!showList)}
          >
            <FiList size={15} />
            {showList ? "Hide List" : "View List"}
          </button>

          <MapContainer
            center={[22.9734, 78.6569]}
            zoom={5}
            className="map-page__map"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            <MapController points={points} focus={flyCenter} />

            {filtered.map((temple) => {
              if (!temple.coordinates) return null;
              const color = categoryColors[categoryOf(temple)];
              return (
                <Marker
                  key={temple.id}
                  position={[temple.coordinates.lat, temple.coordinates.lng]}
                  icon={createIcon(color)}
                  eventHandlers={{ click: () => handleSelectTemple(temple) }}
                >
                  <Popup>
                    <div className="map-popup">
                      <strong>{temple.name}</strong>
                      <p>{temple.district}, {temple.state}</p>
                      <span style={{ color: temple.deityColor }}>{temple.deity}</span>
                      <br />
                      <Link to={`/temples/${temple.slug}`}>View details →</Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Legend */}
          <div className="map-page__legend">
            <p className="map-page__legend-title">Temple Type</p>
            {Object.entries(categoryColors).map(([type, color]) => (
              <div key={type} className="map-page__legend-item">
                <span className="map-page__legend-dot" style={{ background: color }} />
                <span>{type}</span>
              </div>
            ))}
          </div>

          {/* Temple List Overlay */}
          <AnimatePresence>
            {showList && (
              <motion.div
                className="map-page__list-overlay"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3 }}
              >
                <div className="map-page__list-header">
                  <h4>Temples ({filtered.length})</h4>
                  <button type="button" onClick={() => setShowList(false)} aria-label="Close list"><FiX size={16} /></button>
                </div>
                <div className="map-page__list-items">
                  {filtered.length === 0 && <p className="map-page__no-results">No temples match these filters.</p>}
                  {filtered.map((temple) => (
                    <div
                      key={temple.id}
                      className={`map-page__list-item ${selectedTemple?.id === temple.id ? "active" : ""}`}
                      onClick={() => { handleSelectTemple(temple); setShowList(false); }}
                    >
                      <div className="list-item__dot" style={{ background: categoryColors[categoryOf(temple)] }} />
                      <div>
                        <p className="list-item__name">{temple.name}</p>
                        <p className="list-item__loc">{temple.district}</p>
                      </div>
                      <span className="list-item__rating">⭐ {temple.rating}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="map-sidebar">

          {/* Selected Temple */}
          {selectedTemple && (
            <div className="map-sidebar__selected">
              <p className="map-sidebar__section-title">Selected Temple</p>

              <div className="map-sidebar__temple-img">
                <img
                  src={selectedTemple.images?.[0] || FALLBACK_IMAGE}
                  alt={selectedTemple.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                />
                <button type="button" className={`map-sidebar__bookmark ${isFavorite(selectedTemple.id) ? "active" : ""}`}
                  onClick={saveSelected} aria-label="Save to favorites">
                  <FiHeart size={15} fill={isFavorite(selectedTemple.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <h3 className="map-sidebar__temple-name">{selectedTemple.name}</h3>

              <p className="map-sidebar__temple-loc">
                <FiMapPin size={13} />
                {selectedTemple.district}, {selectedTemple.state}
              </p>

              <span
                className="map-sidebar__deity-tag"
                style={{
                  background: `${selectedTemple.deityColor}18`,
                  color: selectedTemple.deityColor
                }}
              >
                {selectedTemple.type}
              </span>

              <p className="map-sidebar__temple-desc">
                {selectedTemple.description?.slice(0, 120)}...
              </p>

              <div className="map-sidebar__temple-meta">
                <div className="meta-item">
                  <span className="meta-item__icon">⭐</span>
                  <span className="meta-item__label">Rating</span>
                  <span className="meta-item__val">{selectedTemple.rating}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-item__icon">🕐</span>
                  <span className="meta-item__label">Opens</span>
                  <span className="meta-item__val">
                    {selectedTemple.timings?.morning?.split(/\s*[-–]\s*/)[0] || "See details"}
                  </span>
                </div>
              </div>

              <div className="map-sidebar__btns">
                <Link
                  to={`/temples/${selectedTemple.slug}`}
                  className="map-sidebar__details-btn"
                >
                  View Details
                </Link>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTemple.coordinates.lat},${selectedTemple.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="map-sidebar__directions-btn"
                >
                  <FiNavigation size={14} />
                  Get Directions
                </a>
              </div>
            </div>
          )}

          {/* Nearby Temples */}
          <div className="map-sidebar__nearby">
            <div className="map-sidebar__nearby-header">
              <p className="map-sidebar__section-title">Nearby Temples</p>
              <Link to={`/temples?district=${encodeURIComponent(selectedTemple?.district || "")}`} className="map-sidebar__view-all">View All</Link>
            </div>
            <div className="map-sidebar__nearby-list">
              {nearby.map((t) => (
                <button type="button" key={t.id} className="map-sidebar__nearby-item" onClick={() => handleSelectTemple(t)}>
                  <div className="nearby-item__img">
                    <img src={t.images?.[0] || FALLBACK_IMAGE} alt={t.name} loading="lazy"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
                  </div>
                  <div className="nearby-item__info">
                    <p className="nearby-item__name">{t.name}</p>
                    <p className="nearby-item__dist">
                      <FiMapPin size={11} /> {t.distance} km away
                    </p>
                  </div>
                  <FiChevronRight size={15} className="nearby-item__arrow" />
                </button>
              ))}
            </div>
          </div>

        </aside>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              className="map-page__filter-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              className="map-page__filter-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="map-page__drawer-header">
                <h3>Filters</h3>
                <button type="button" onClick={() => setFilterOpen(false)} aria-label="Close filters"><FiX size={20} /></button>
              </div>
              <div className="map-page__drawer-body">
                {filterControls}
              </div>
              <div className="map-page__drawer-footer">
                <button type="button" className="map-page__drawer-reset" onClick={resetFilters}>Reset</button>
                <button type="button" className="map-page__drawer-apply" onClick={() => setFilterOpen(false)}>
                  Show {filtered.length} temple{filtered.length === 1 ? "" : "s"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}