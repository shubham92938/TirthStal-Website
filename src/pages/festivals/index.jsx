import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiSearch, FiCalendar, FiMapPin, FiRefreshCw, FiArrowRight,
  FiChevronRight, FiClock, FiMail,
} from "react-icons/fi";
import Select from "../../components/common/Select";
import { allFestivals, nextOccurrence, festivalMonths } from "../../data/festivalStore";
import { FALLBACK_IMAGE } from "../../data/store";
import { subscribeNewsletter, isEmail } from "../../services/outreachService";
import "../../styles/pages/festivalsPage.css";

const PAGE = 9;

const unique = (key) => ["All", ...Array.from(new Set(allFestivals.map((f) => f[key]))).sort()];
const typeOptions  = unique("type").map((t) => (t === "All" ? { value: "All", label: "All Types" } : t));
const stateOptions = unique("state").map((t) => (t === "All" ? { value: "All", label: "All States" } : t));
const monthOptions = [{ value: "All", label: "All Months" }, ...festivalMonths];

const guideItems = [
  { icon: "🪔", title: "How to Participate", sub: "Learn the rituals and significance",
    body: "Read each festival's “How to celebrate” section, dress modestly, carry offerings the temple allows, and follow the priests' guidance on queues and darshan." },
  { icon: "🧳", title: "Travel & Stay", sub: "Tips for a comfortable journey",
    body: "Book trains and stays 4–6 weeks ahead for big melas, reach early for darshan, and keep a printed copy of your tickets and ID." },
  { icon: "🛡️", title: "Do's & Don'ts", sub: "Follow guidelines and respect traditions",
    body: "Do keep footwear at the designated counters and respect photography rules. Don't litter, skip queues, or carry restricted items into the sanctum." },
];

const monthShort = (d) => d.format("MMM").toUpperCase();

export default function Festivals() {
  const [params, setParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE);
  const [guideOpen, setGuideOpen] = useState(null);
  const [email, setEmail] = useState("");

  const search = params.get("q") || "";
  const month  = params.get("month") || "All";
  const state  = params.get("state") || "All";
  const type   = params.get("type") || "All";

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "All") next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
    setVisible(PAGE);
  };

  const enriched = useMemo(
    () => allFestivals.map((f) => ({ ...f, next: nextOccurrence(f) })).sort((a, b) => a.next.daysAway - b.next.daysAway),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((f) => {
      const matchQ = !q || [f.name, f.location, f.deity, f.type].some((x) => x.toLowerCase().includes(q))
        || f.templesCelebrated?.some((t) => t.toLowerCase().includes(q));
      const matchM = month === "All" || f.month.toLowerCase().includes(month.toLowerCase());
      const matchT = type === "All" || f.type === type;
      const matchS = state === "All" || f.state === state;
      return matchQ && matchM && matchT && matchS;
    });
  }, [enriched, search, month, type, state]);

  const hasFilters = search || month !== "All" || state !== "All" || type !== "All";
  const reset = () => { setParams({}, { replace: true }); setVisible(PAGE); };
  const upNext = enriched.slice(0, 4);
  const hero = enriched[0];

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) { toast.error("Please enter a valid email address"); return; }
    try {
      const { delivered } = await subscribeNewsletter(email.trim());
      toast.success(delivered ? "You'll get festival reminders 🪔" : "Thanks! We've noted your email 🪔");
      setEmail("");
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="fx-page">
      <div className="fx-hero">
        <div className="fx-hero__glow" />
        <div className="fx-hero__inner">
          <div className="fx-crumb">
            <Link to="/">Home</Link><FiChevronRight size={13} /><span>Festivals</span>
          </div>
          <span className="fx-hero__eyebrow">🪔 Celebrate with devotion</span>
          <h1 className="fx-hero__title">Festivals <em>of Faith</em></h1>
          <p className="fx-hero__sub">
            Rituals, processions and melas that light up temples across the state — find the next one and plan your visit.
          </p>
          {hero && (
            <Link to={`/festivals/${hero.slug}`} className="fx-hero__next">
              <span className="fx-hero__next-days">
                <b>{hero.next.daysAway}</b><small>{hero.next.daysAway === 1 ? "day" : "days"}</small>
              </span>
              <span className="fx-hero__next-text">
                <small>Up next{hero.next.approx ? " (approx.)" : ""}</small>
                <strong>{hero.name}</strong>
                <em><FiMapPin size={12} /> {hero.location} · {hero.next.date.format("D MMM YYYY")}</em>
              </span>
              <FiArrowRight />
            </Link>
          )}
        </div>
      </div>

      <div className="fx-filter">
        <div className="fx-filter__search">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search festivals, temples, deities…"
            value={search}
            onChange={(e) => setParam("q", e.target.value)}
            aria-label="Search festivals"
          />
        </div>
        <Select value={month} options={monthOptions} onChange={(v) => setParam("month", v)} ariaLabel="Month" icon={<FiCalendar size={14} />} />
        <Select value={state} options={stateOptions} onChange={(v) => setParam("state", v)} ariaLabel="State" icon={<FiMapPin size={14} />} />
        <Select value={type}  options={typeOptions}  onChange={(v) => setParam("type", v)}  ariaLabel="Festival type" />
        <button type="button" className="fx-filter__reset" onClick={reset} disabled={!hasFilters}>
          <FiRefreshCw size={13} /> Reset
        </button>
      </div>

      <div className="fx-body">
        <div className="fx-main">
          <div className="fx-main__head">
            <div>
              <span className="section-eyebrow">All celebrations</span>
              <h2 className="fx-main__title">{hasFilters ? "Matching festivals" : "Popular Festivals"}</h2>
            </div>
            <p className="fx-main__count">{filtered.length} festival{filtered.length === 1 ? "" : "s"}</p>
          </div>

          {filtered.length === 0 ? (
            <div className="fx-empty">
              <span>🪔</span>
              <h3>No festivals match your filters</h3>
              <p>Try a different month or clear the filters.</p>
              <button type="button" onClick={reset}>Clear all filters</button>
            </div>
          ) : (
            <div className="fx-grid">
              <AnimatePresence mode="popLayout">
                {filtered.slice(0, visible).map((f, i) => (
                  <motion.div
                    key={f.slug}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04 }}
                  >
                    <Link to={`/festivals/${f.slug}`} className="fx-card" style={{ "--accent": f.deityColor }}>
                      <div className="fx-card__img">
                        <img src={f.image} alt={f.name} loading="lazy"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
                        <span className="fx-card__date">
                          <b>{f.next.date.format("DD")}</b>{monthShort(f.next.date)}
                        </span>
                        <span className="fx-card__type">{f.type}</span>
                      </div>
                      <div className="fx-card__body">
                        <h3>{f.name}</h3>
                        <p className="fx-card__loc"><FiMapPin size={13} /> {f.location}</p>
                        <p className="fx-card__desc">{f.description}</p>
                        <div className="fx-card__foot">
                          <span><FiClock size={13} /> {f.next.daysAway === 0 ? "Today" : `In ${f.next.daysAway} days`}{f.next.approx ? " ~" : ""}</span>
                          <span className="fx-card__go">Details <FiArrowRight size={13} /></span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {filtered.length > visible && (
            <div className="fx-more">
              <button type="button" onClick={() => setVisible((v) => v + PAGE)}>
                Load more festivals ({filtered.length - visible} left)
              </button>
            </div>
          )}
        </div>

        <aside className="fx-side">
          <div className="fx-box">
            <h3 className="fx-box__title"><FiCalendar size={16} /> Coming up next</h3>
            <div className="fx-up">
              {upNext.map((f) => (
                <Link key={f.slug} to={`/festivals/${f.slug}`} className="fx-up__item">
                  <span className="fx-up__date"><small>{monthShort(f.next.date)}</small><b>{f.next.date.format("DD")}</b></span>
                  <span className="fx-up__info">
                    <strong>{f.name}</strong>
                    <small>{f.location}</small>
                    <em>{f.next.daysAway === 0 ? "Today" : `In ${f.next.daysAway} days`}{f.next.approx ? " (approx.)" : ""}</em>
                  </span>
                </Link>
              ))}
            </div>
            <p className="fx-note">Hindu festival dates follow the lunar calendar — confirm exact dates with the temple.</p>
          </div>

          <form className="fx-box fx-news" onSubmit={onSubscribe} noValidate>
            <span className="fx-news__icon"><FiMail /></span>
            <h3>Never miss a festival</h3>
            <p>Get reminders and festival guides in your inbox.</p>
            <input type="email" placeholder="Your email address" value={email}
              onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
            <button type="submit">Notify me</button>
          </form>

          <div className="fx-box">
            <h3 className="fx-box__title">Festival Guide</h3>
            {guideItems.map((g, i) => (
              <div key={g.title} className={`fx-guide ${guideOpen === i ? "open" : ""}`}>
                <button type="button" onClick={() => setGuideOpen(guideOpen === i ? null : i)} aria-expanded={guideOpen === i}>
                  <span className="fx-guide__icon">{g.icon}</span>
                  <span><strong>{g.title}</strong><small>{g.sub}</small></span>
                  <FiChevronRight size={16} />
                </button>
                {guideOpen === i && <p>{g.body}</p>}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
