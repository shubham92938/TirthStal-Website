import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiHome, FiChevronRight, FiFilter, FiX, FiChevronLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import TempleFilters from "../../components/temple/TempleFilters";
import TempleCard from "../../components/temple/TempleCard";
import { allTemples, sortTemples, deityFamilies } from "../../data/store";
import "../../styles/pages/temples.css";

const ITEMS_PER_PAGE = 12;
const STOP_WORDS = new Set(["temple", "temples", "mandir", "the", "in", "of"]);
const DEFAULTS = { state: "All States", district: "All Districts", sort: "Popularity" };

// ── URL  <->  filters ──
const readFilters = (sp) => ({
  search:   sp.get("search")   || "",
  state:    sp.get("state")    || DEFAULTS.state,
  district: sp.get("district") || DEFAULTS.district,
  deities:  (sp.get("deity") || "").split(",").map((d) => d.trim()).filter(Boolean),
  type:     sp.get("type")     || "",
  sort:     sp.get("sort")     || DEFAULTS.sort,
});

const matches = (t, f) => {
  if (f.search) {
    const tokens = f.search.toLowerCase().split(/\s+/).filter((w) => w && !STOP_WORDS.has(w));
    const hay = `${t.name} ${t.deity} ${t.district} ${t.type} ${t.state} ${t.address} ${t.family}`.toLowerCase();
    if (!tokens.every((w) => hay.includes(w))) return false;
  }
  if (f.state !== DEFAULTS.state && t.state !== f.state) return false;
  if (f.district !== DEFAULTS.district && t.district !== f.district) return false;
  if (f.deities.length && !f.deities.some((d) => t.family.toLowerCase() === d.toLowerCase() || t.deity.toLowerCase().includes(d.toLowerCase()))) return false;
  if (f.type && !t.type?.toLowerCase().includes(f.type.toLowerCase())) return false;
  return true;
};

export default function Temples() {
  const [sp, setSp] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const gridTop = useRef(null);

  const filters = useMemo(() => readFilters(sp), [sp]);
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);

  // Update any subset of filters in the URL. Resets to page 1 unless `page` passed.
  const update = useCallback((patch, { replace = false } = {}) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([key, value]) => {
      const param = key === "deities" ? "deity" : key;
      const isEmpty =
        value === "" || value == null ||
        (Array.isArray(value) && value.length === 0) ||
        (key in DEFAULTS && value === DEFAULTS[key]);
      if (isEmpty) next.delete(param);
      else next.set(param, Array.isArray(value) ? value.join(",") : String(value));
    });
    if (!("page" in patch)) next.delete("page");
    setSp(next, { replace });
  }, [sp, setSp]);

  const clearAll = useCallback(() => setSp(new URLSearchParams()), [setSp]);

  // lock scroll when filter drawer open (mobile)
  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const filtered = useMemo(
    () => sortTemples(allTemples.filter((t) => matches(t, filters)), filters.sort),
    [filters]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (p) => {
    update({ page: p > 1 ? p : "" });
    gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPageNumbers = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, 2, totalPages - 1, totalPages, safePage - 1, safePage, safePage + 1]);
    const nums = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const out = [];
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] > 1) out.push("...");
      out.push(n);
    });
    return out;
  };

  // Chips for every active filter (each one removable)
  const chips = [
    filters.search && { key: "search", label: `“${filters.search}”`, clear: { search: "" } },
    filters.state !== DEFAULTS.state && { key: "state", label: filters.state, clear: { state: DEFAULTS.state, district: DEFAULTS.district } },
    filters.district !== DEFAULTS.district && { key: "district", label: `${filters.district} district`, clear: { district: DEFAULTS.district } },
    filters.type && { key: "type", label: filters.type, clear: { type: "" } },
    ...filters.deities.map((d) => ({ key: `deity-${d}`, label: d, clear: { deities: filters.deities.filter((x) => x !== d) } })),
  ].filter(Boolean);

  const activeCount = chips.length;
  const from = filtered.length ? (safePage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const to   = Math.min(safePage * ITEMS_PER_PAGE, filtered.length);

  const title =
    filters.district !== DEFAULTS.district ? `Temples in ${filters.district}` :
    filters.state    !== DEFAULTS.state    ? `Temples in ${filters.state}` :
    filters.type                           ? `${filters.type} Temples` :
    filters.deities.length === 1           ? `${filters.deities[0]} Temples` :
                                             "All Temples";

  return (
    <div className="temples-page">

      {/* Breadcrumb */}
      <div className="temples-page__breadcrumb">
        <Link to="/" className="breadcrumb__item"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} className="breadcrumb__sep" />
        <span className="breadcrumb__item breadcrumb__item--active">Temples</span>
      </div>

      {/* Header banner */}
      <div className="temples-page__hero">
        <div className="temples-page__hero-glow" />
        <div className="temples-page__header">
          <div>
            <span className="temples-page__eyebrow">🪔 Sacred places · Divine journeys</span>
            <h1 className="temples-page__title">{title}</h1>
            <p className="temples-page__sub">
              <strong>{filtered.length}</strong> {filtered.length === 1 ? "temple" : "temples"} found
              {filtered.length > 0 && <> · showing {from}–{to}</>}
            </p>
          </div>
          <button type="button" className="temples-page__filter-btn" onClick={() => setFilterOpen(true)}>
            <FiFilter size={15} />
            Filters
            {activeCount > 0 && <span className="temples-page__filter-badge">{activeCount}</span>}
          </button>
        </div>

        {/* Quick deity pills */}
        <div className="temples-page__pills" role="group" aria-label="Quick deity filter">
          <button
            type="button"
            className={`pill ${filters.deities.length === 0 ? "active" : ""}`}
            onClick={() => update({ deities: [] })}
          >
            All
          </button>
          {deityFamilies.filter((d) => d.count > 0).map((d) => (
            <button
              type="button"
              key={d.name}
              className={`pill ${filters.deities.includes(d.name) ? "active" : ""}`}
              onClick={() => update({
                deities: filters.deities.includes(d.name)
                  ? filters.deities.filter((x) => x !== d.name)
                  : [...filters.deities, d.name],
              })}
            >
              {d.name} <span>{d.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="temples-page__body">

        {/* Desktop Sidebar */}
        <div className="temples-page__sidebar-desktop">
          <TempleFilters filters={filters} onChange={update} onClear={clearAll} activeCount={activeCount} />
        </div>

        {/* Grid */}
        <div className="temples-page__right" ref={gridTop}>

          {/* Active filter chips */}
          <AnimatePresence initial={false}>
            {chips.length > 0 && (
              <motion.div
                className="temples-page__chips"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {chips.map((c) => (
                  <button type="button" key={c.key} className="chip" onClick={() => update(c.clear)}>
                    {c.label} <FiX size={12} />
                  </button>
                ))}
                <button type="button" className="chip chip--clear" onClick={clearAll}>Clear all</button>
              </motion.div>
            )}
          </AnimatePresence>

          {paginated.length === 0 ? (
            <div className="temples-page__empty">
              <span>🛕</span>
              <h3>No temples match these filters</h3>
              <p>Try removing a filter or searching with a different word.</p>
              <button type="button" onClick={clearAll}>Clear Filters</button>
            </div>
          ) : (
            <div className="temples-page__grid">
              {paginated.map((temple, i) => (
                <TempleCard key={temple.id} temple={temple} index={i} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="temples-page__pagination" aria-label="Pagination">
              <button
                type="button"
                className="page-btn page-btn--nav"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Previous page"
              ><FiChevronLeft /></button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="page-dots">…</span>
                ) : (
                  <button
                    type="button"
                    key={p}
                    className={`page-btn ${safePage === p ? "active" : ""}`}
                    onClick={() => goToPage(p)}
                    aria-current={safePage === p ? "page" : undefined}
                  >{p}</button>
                )
              )}
              <button
                type="button"
                className="page-btn page-btn--nav"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Next page"
              ><FiChevronRight /></button>
            </nav>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              className="temples-page__filter-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              className="temples-page__filter-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="temples-page__drawer-header">
                <h3>Filters</h3>
                <button type="button" onClick={() => setFilterOpen(false)} aria-label="Close filters"><FiX size={20} /></button>
              </div>
              <div className="temples-page__drawer-body">
                <TempleFilters filters={filters} onChange={update} onClear={clearAll} activeCount={activeCount} />
              </div>
              <div className="temples-page__drawer-footer">
                <button type="button" className="temples-page__drawer-apply" onClick={() => setFilterOpen(false)}>
                  Show {filtered.length} Temples
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
