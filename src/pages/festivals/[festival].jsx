import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiChevronRight, FiMapPin, FiCalendar, FiClock, FiShare2, FiArrowLeft,
  FiArrowRight, FiDownload, FiUsers,
} from "react-icons/fi";
import { allFestivals, getFestivalBySlug, nextOccurrence } from "../../data/festivalStore";
import { allTemples, FALLBACK_IMAGE } from "../../data/store";
import "../../styles/pages/festivalDetail.css";

const sections = [
  { id: "about",      label: "About",           key: "description" },
  { id: "history",    label: "History",         key: "history" },
  { id: "importance", label: "Significance",    key: "importance" },
  { id: "celebrate",  label: "How to Celebrate", key: "howToCelebrate" },
];

// match "Mahakaleshwar Temple, Ujjain" to a temple in the local dataset
const norm = (s = "") => s.toLowerCase().replace(/\b(shri|sri|temple|mandir|temples)\b/g, "").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
const matchTemple = (label) => {
  const name = norm(label.split(",")[0]);
  if (!name) return null;
  return allTemples.find((t) => {
    const tn = norm(t.name);
    return tn && (tn.includes(name) || name.includes(tn));
  }) || null;
};

const icsDate = (d) => d.format("YYYYMMDD");
const downloadIcs = (f, next) => {
  const end = next.date.add(1, "day");
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tirthstal//Festivals//EN", "BEGIN:VEVENT",
    `UID:${f.slug}-${icsDate(next.date)}@tirthstal`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${icsDate(next.date)}`, `DTEND;VALUE=DATE:${icsDate(end)}`,
    `SUMMARY:${f.name}`, `LOCATION:${f.location}`,
    `DESCRIPTION:${f.description.slice(0, 200).replace(/\n/g, " ")}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url; a.download = `${f.slug}.ics`; a.click();
  URL.revokeObjectURL(url);
};

export default function FestivalDetail() {
  const { slug } = useParams();
  const festival = getFestivalBySlug(slug);
  const [tab, setTab] = useState("about");

  const next = useMemo(() => (festival ? nextOccurrence(festival) : null), [festival]);
  const temples = useMemo(
    () => (festival?.templesCelebrated || []).map((label) => ({ label, temple: matchTemple(label) })),
    [festival]
  );
  const others = useMemo(
    () => allFestivals.filter((f) => f.slug !== slug && (f.deity === festival?.deity || f.type === festival?.type)).slice(0, 3),
    [slug, festival]
  );

  if (!festival) {
    return (
      <div className="fd-missing">
        <span>🪔</span>
        <h1>Festival not found</h1>
        <p>We couldn't find “{slug}”. It may have moved or never existed.</p>
        <Link to="/festivals" className="fd-btn fd-btn--primary"><FiArrowLeft /> All festivals</Link>
      </div>
    );
  }

  const share = async () => {
    const data = { title: festival.name, text: `${festival.name} — ${festival.location}`, url: window.location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url);
      toast.success("Link copied to clipboard");
    } catch (err) {
      if (err?.name !== "AbortError") toast.error("Couldn't share this page");
    }
  };

  const active = sections.find((s) => s.id === tab);

  return (
    <div className="fd-page" style={{ "--accent": festival.deityColor }}>
      <div className="fd-hero">
        <img loading="lazy" decoding="async" src={festival.image} alt={festival.name}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
        <div className="fd-hero__shade" />
        <div className="fd-hero__inner">
          <div className="fd-crumb">
            <Link to="/">Home</Link><FiChevronRight size={13} />
            <Link to="/festivals">Festivals</Link><FiChevronRight size={13} />
            <span>{festival.name}</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="fd-chip">{festival.type}</span>
            <h1>{festival.name}</h1>
            <p className="fd-hero__meta">
              <span><FiMapPin size={14} /> {festival.location}</span>
              <span><FiCalendar size={14} /> {festival.month}</span>
              <span><FiClock size={14} /> {festival.duration}</span>
            </p>
            <div className="fd-hero__actions">
              {next?.date && (
                <button type="button" className="fd-btn fd-btn--primary" onClick={() => { downloadIcs(festival, next); toast.success("Calendar file downloaded"); }}>
                  <FiDownload /> Add to calendar
                </button>
              )}
              <button type="button" className="fd-btn fd-btn--ghost" onClick={share}><FiShare2 /> Share</button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="fd-body">
        <main className="fd-main">
          <div className="fd-tabs" role="tablist">
            {sections.map((s) => (
              <button key={s.id} type="button" role="tab" aria-selected={tab === s.id}
                className={tab === s.id ? "active" : ""} onClick={() => setTab(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
          <motion.article key={tab} className="fd-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h2>{active.label}</h2>
            <p>{festival[active.key]}</p>
          </motion.article>

          {temples.length > 0 && (
            <section className="fd-card">
              <h2>Where it's celebrated</h2>
              <div className="fd-temples">
                {temples.map(({ label, temple }) => {
                  const inner = (
                    <>
                      <span className="fd-temples__ico">🛕</span>
                      <span>{label}</span>
                      {temple && <FiArrowRight size={15} />}
                    </>
                  );
                  return temple
                    ? <Link key={label} to={`/temples/${temple.slug}`} className="fd-temples__item is-link">{inner}</Link>
                    : <div key={label} className="fd-temples__item">{inner}</div>;
                })}
              </div>
            </section>
          )}
        </main>

        <aside className="fd-side">
          <div className="fd-count">
            <span className="fd-count__label">{next?.approx ? "Expected around" : "Next celebration"}</span>
            {next?.date ? (
              <>
                <b>{next.date.format("D MMM YYYY")}</b>
                <strong>{next.daysAway === 0 ? "Today!" : `${next.daysAway} days to go`}</strong>
              </>
            ) : <b>Date to be announced</b>}
            <small>Festival dates follow the Hindu lunar calendar and shift every year. Please confirm with the temple.</small>
          </div>

          <div className="fd-facts">
            <h3>Quick facts</h3>
            <dl>
              <div><dt><FiUsers /> Deity</dt><dd>{festival.deity}</dd></div>
              <div><dt><FiCalendar /> Month</dt><dd>{festival.month}</dd></div>
              <div><dt><FiClock /> Duration</dt><dd>{festival.duration}</dd></div>
              <div><dt><FiMapPin /> State</dt><dd>{festival.state}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="fd-more">
          <span className="section-eyebrow">Keep exploring</span>
          <h2>More festivals</h2>
          <div className="fd-more__grid">
            {others.map((f) => (
              <Link key={f.slug} to={`/festivals/${f.slug}`} className="fd-more__card">
                <img src={f.image} alt={f.name} loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} />
                <div><strong>{f.name}</strong><small>{f.month} · {f.location}</small></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
