import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiSearch, FiMapPin, FiChevronRight, FiHome, FiChevronLeft,
  FiSun, FiNavigation, FiStar, FiArrowRight,
} from "react-icons/fi";
import Select from "../../components/common/Select";
import TempleCard from "../../components/temple/TempleCard";
import { districts } from "../../data/districts";
import { districtImages } from "../../data/templeImages";
import { getTemplesByDistrictName, sortTemples, SORT_OPTIONS, FALLBACK_IMAGE } from "../../data/store";
import "../../styles/pages/districtPage.css";

const ITEMS_PER_PAGE = 8;

const imgFor = (d) => districtImages[d.slug] || FALLBACK_IMAGE;
const onImgError = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; };

const withCounts = districts.map((d) => ({ ...d, count: getTemplesByDistrictName(d.name).length }));

/* ───────── /districts  (overview of every district) ───────── */
function DistrictsOverview() {
  const [q, setQ] = useState("");
  const [onlyTemples, setOnlyTemples] = useState(false);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return withCounts
      .filter((d) => (!term || d.name.toLowerCase().includes(term)) && (!onlyTemples || d.count > 0))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [q, onlyTemples]);

  return (
    <div className="dp-page">
      <section className="dp-hero dp-hero--overview">
        <div className="dp-hero__inner">
          <div className="dp-crumb"><Link to="/"><FiHome size={13} /> Home</Link><FiChevronRight size={13} /><span>Districts</span></div>
          <span className="section-eyebrow" style={{ color: "var(--gold)" }}>Wander the heartland</span>
          <h1>Explore by <em>District</em></h1>
          <p>{districts.length} districts, each with its own sacred stories. Pick one to see its temples, best season and how to reach.</p>
        </div>
      </section>

      <div className="dp-container">
        <div className="dp-toolbar">
          <div className="dp-search">
            <FiSearch size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search districts…" aria-label="Search districts" />
          </div>
          <label className="dp-toggle">
            <input type="checkbox" checked={onlyTemples} onChange={(e) => setOnlyTemples(e.target.checked)} />
            <span /> With listed temples only
          </label>
          <span className="dp-toolbar__count">{list.length} districts</span>
        </div>

        {list.length === 0 ? (
          <div className="dp-empty"><span>🗺️</span><h3>No district matches “{q}”</h3>
            <button type="button" onClick={() => { setQ(""); setOnlyTemples(false); }}>Clear filters</button></div>
        ) : (
          <div className="dp-grid dp-grid--districts">
            {list.map((d, i) => (
              <motion.div key={d.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04 }}>
                <Link to={`/districts/${d.slug}`} className="dp-dcard">
                  <img src={imgFor(d)} alt={d.name} loading="lazy" onError={onImgError} />
                  <div className="dp-dcard__shade" />
                  <div className="dp-dcard__text">
                    <strong><FiMapPin size={14} /> {d.name}</strong>
                    <span>{d.count ? `${d.count} temple${d.count > 1 ? "s" : ""} listed` : "District guide"}</span>
                  </div>
                  <span className="dp-dcard__go"><FiArrowRight /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── /districts/:slug ───────── */
function DistrictDetail({ district }) {
  const [search, setSearch] = useState("");
  const [dSearch, setDSearch] = useState("");
  const [sortBy, setSortBy] = useState("Popularity");
  const [page, setPage] = useState(1);

  const temples = useMemo(() => getTemplesByDistrictName(district.name), [district]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? temples.filter((t) => [t.name, t.type, t.deity, t.address].some((x) => x?.toLowerCase().includes(q))) : temples;
    return sortTemples(list, sortBy);
  }, [temples, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(shown.length / ITEMS_PER_PAGE));
  const current = Math.min(page, totalPages);
  const paginated = shown.slice((current - 1) * ITEMS_PER_PAGE, current * ITEMS_PER_PAGE);

  const sidebarList = withCounts
    .filter((d) => d.state === district.state && d.name.toLowerCase().includes(dSearch.toLowerCase()))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const avgRating = temples.length ? (temples.reduce((s, t) => s + (t.rating || 0), 0) / temples.length).toFixed(1) : "–";
  const deities = new Set(temples.map((t) => t.deity)).size;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - current) <= 1)
    .reduce((acc, p, i, arr) => { if (i && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, []);

  return (
    <div className="dp-page">
      <section className="dp-hero">
        <img className="dp-hero__bg" src={imgFor(district)} alt="" onError={onImgError} />
        <div className="dp-hero__shade" />
        <div className="dp-hero__inner">
          <div className="dp-crumb">
            <Link to="/"><FiHome size={13} /> Home</Link><FiChevronRight size={13} />
            <Link to="/districts">Districts</Link><FiChevronRight size={13} />
            <span>{district.name}</span>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {district.name} <em>District</em>
          </motion.h1>
          <p>{district.description.split(". ").slice(0, 2).join(". ")}.</p>
          <div className="dp-pills">
            <span>📍 {district.state}</span>
            <span>🛕 {temples.length} listed temple{temples.length === 1 ? "" : "s"}</span>
            <span><FiSun size={13} /> {district.bestTimeToVisit}</span>
          </div>
        </div>
      </section>

      <div className="dp-container dp-layout">
        <aside className="dp-side">
          <h3>Districts in {district.state}</h3>
          <div className="dp-search dp-search--sm">
            <FiSearch size={14} />
            <input value={dSearch} onChange={(e) => setDSearch(e.target.value)} placeholder="Search district…" aria-label="Search districts" />
          </div>
          <ul>
            {sidebarList.map((d) => (
              <li key={d.slug}>
                <Link to={`/districts/${d.slug}`} className={d.slug === district.slug ? "active" : ""}>
                  <span>{d.name}</span><b>{d.count}</b>
                </Link>
              </li>
            ))}
            {sidebarList.length === 0 && <li className="dp-side__none">No district found</li>}
          </ul>
          <Link to="/districts" className="dp-side__all"><FiMapPin size={14} /> View all districts</Link>
        </aside>

        <main className="dp-main">
          <div className="dp-stats">
            <div><b>{temples.length}</b><span>Listed temples</span></div>
            <div><b>{deities || "–"}</b><span>Deities</span></div>
            <div><b>{avgRating}</b><span>Avg. rating</span></div>
            <div><b>{district.famousFor?.length || 0}</b><span>Famous attractions</span></div>
          </div>

          <div className="dp-info">
            <div className="dp-info__card">
              <h3><FiStar size={16} /> Famous for</h3>
              <div className="dp-chips">{district.famousFor?.map((f) => <span key={f}>{f}</span>)}</div>
              <p>{district.description}</p>
            </div>
            <div className="dp-info__card dp-info__card--reach">
              <h3><FiNavigation size={16} /> How to reach</h3>
              <p>{district.howToReach}</p>
              {district.coordinates && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${district.coordinates.lat},${district.coordinates.lng}`}
                  target="_blank" rel="noopener noreferrer" className="dp-link">
                  Open in Google Maps <FiArrowRight size={14} />
                </a>
              )}
            </div>
          </div>

          <div className="dp-head">
            <div>
              <span className="section-eyebrow">Sacred places</span>
              <h2>Temples in {district.name}</h2>
            </div>
            {temples.length > 0 && (
              <div className="dp-head__tools">
                <div className="dp-search dp-search--sm">
                  <FiSearch size={14} />
                  <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search temples…" aria-label="Search temples" />
                </div>
                <Select value={sortBy} options={SORT_OPTIONS} onChange={(v) => { setSortBy(v); setPage(1); }} ariaLabel="Sort temples" />
              </div>
            )}
          </div>

          {temples.length === 0 ? (
            <div className="dp-empty">
              <span>🛕</span>
              <h3>Temples for {district.name} are coming soon</h3>
              <p>We're adding temples district by district. Meanwhile, explore {district.name}'s highlights above{district.topTemples?.length ? ` — ${district.topTemples.slice(0, 3).join(", ")}` : ""}.</p>
              <Link to="/temples" className="dp-btn">Browse all temples</Link>
            </div>
          ) : shown.length === 0 ? (
            <div className="dp-empty"><span>🔍</span><h3>No temple matches “{search}”</h3>
              <button type="button" onClick={() => setSearch("")}>Clear search</button></div>
          ) : (
            <div className="dp-grid">
              {paginated.map((t, i) => <TempleCard key={t.id} temple={t} index={i} />)}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="dp-pager" aria-label="Pagination">
              <button type="button" onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1} aria-label="Previous page"><FiChevronLeft /></button>
              {pages.map((p, i) => p === "…"
                ? <span key={`d${i}`}>…</span>
                : <button key={p} type="button" className={p === current ? "active" : ""} onClick={() => setPage(p)}>{p}</button>)}
              <button type="button" onClick={() => setPage(Math.min(totalPages, current + 1))} disabled={current === totalPages} aria-label="Next page"><FiChevronRight /></button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DistrictPage() {
  const { district: slug } = useParams();
  if (!slug) return <DistrictsOverview />;
  const district = districts.find((d) => d.slug === slug);

  if (!district) {
    return (
      <div className="dp-page">
        <div className="dp-container dp-empty" style={{ marginTop: 80 }}>
          <span>🗺️</span>
          <h3>We couldn't find a district called “{slug}”</h3>
          <Link to="/districts" className="dp-btn">See all districts</Link>
        </div>
      </div>
    );
  }
  // key → local state (search / sort / page) resets when switching district
  return <DistrictDetail key={district.slug} district={district} />;
}
