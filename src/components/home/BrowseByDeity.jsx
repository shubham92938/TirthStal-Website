import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { deityFamilies } from "../../data/store";
import "../../styles/home/browseByDeity.css";

const META = {
  Shiva:    { icon: "🔱", color: "#3b82f6" },
  Vishnu:   { icon: "🪷", color: "#8b5cf6" },
  Devi:     { icon: "🌸", color: "#ec4899" },
  Ganesh:   { icon: "🐘", color: "#10b981" },
  Hanuman:  { icon: "🙏", color: "#f97316" },
  "Sai Baba": { icon: "✨", color: "#f59e0b" },
  Surya:    { icon: "☀️", color: "#eab308" },
};

export default function BrowseByDeity() {
  // Only deities that actually have temples listed
  const items = deityFamilies.filter((d) => d.count > 0);

  return (
    <section className="deity">
      <div className="deity__header">
        <div>
          <span className="section-eyebrow">Find your devata</span>
          <h2 className="deity__title">Browse by Deity</h2>
        </div>
        <Link to="/temples" className="deity__view-all">
          View All <FiArrowRight size={15} />
        </Link>
      </div>

      <div className="deity__grid">
        {items.map((deity, i) => {
          const meta = META[deity.name] || { icon: "🛕", color: "#c8610a" };
          return (
            <motion.div
              key={deity.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                to={`/temples?deity=${encodeURIComponent(deity.name)}`}
                className="deity__card"
                style={{ "--c": meta.color }}
              >
                <div className="deity__icon-wrap">
                  <span className="deity__icon">{meta.icon}</span>
                </div>
                <span className="deity__name">{deity.name}</span>
                <span className="deity__count">{deity.count} {deity.count === 1 ? "temple" : "temples"}</span>
              </Link>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: items.length * 0.07 }}
        >
          <Link to="/temples" className="deity__card deity__card--more" style={{ "--c": "#c8610a" }}>
            <div className="deity__icon-wrap"><span className="deity__icon">⊕</span></div>
            <span className="deity__name">All Temples</span>
            <span className="deity__count">Browse everything</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
