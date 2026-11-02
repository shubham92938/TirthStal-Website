import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import { upcomingFestivals } from "../../data/festivalStore";
import "../../styles/home/upcomingFestivals.css";

const label = (n) => (n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`);

export default function UpcomingFestivals() {
  const list = upcomingFestivals(4);

  return (
    <section className="upfest">
      <div className="upfest__inner">
        <div className="upfest__header">
          <div>
            <span className="section-eyebrow" style={{ color: "var(--gold)" }}>Mark your calendar</span>
            <h2 className="upfest__title">Upcoming Festivals</h2>
          </div>
          <Link to="/festivals" className="upfest__all">
            All festivals <FiArrowRight size={15} />
          </Link>
        </div>

        <div className="upfest__grid">
          {list.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Link to={`/festivals/${f.slug}`} className="upfest__card">
                <div className="upfest__date">
                  <span>{f.next.date.format("MMM")}</span>
                  <strong>{f.next.date.format("DD")}</strong>
                </div>
                <div className="upfest__info">
                  <h3>{f.name}</h3>
                  <p><FiMapPin size={12} /> {f.location}</p>
                  <span className="upfest__when">{label(f.next.daysAway)}{f.next.approx ? " · approx." : ""}</span>
                </div>
                <FiArrowRight className="upfest__arrow" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
