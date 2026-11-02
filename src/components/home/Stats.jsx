import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { allTemples } from "../../data/store";
import { districts } from "../../data/districts";
import { allFestivals } from "../../data/festivalStore";
import "../../styles/home/stats.css";

const deityCount = new Set(allTemples.map((t) => t.deity)).size;

function CountUp({ target, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <span ref={ref} className="stat__value">
      {value.toLocaleString("en-IN")}{suffix}
    </span>
  );
}

export default function Stats() {
  const { t } = useTranslation();

  const stats = [
    { icon: "🛕", value: allTemples.length,  suffix: "", label: t("stats.temples") },
    { icon: "🏙️", value: districts.length,     suffix: "", label: t("stats.districts") },
    { icon: "🕉️", value: deityCount,           suffix: "", label: t("stats.deities") },
    { icon: "🪔", value: allFestivals.length,  suffix: "", label: t("nav.festivals") },
  ];

  return (
    <section className="stats">
      <div className="stats__grid">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="stat__item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
          >
            <span className="stat__icon">{stat.icon}</span>
            <div className="stat__info">
              <CountUp target={stat.value} suffix={stat.suffix} />
              <span className="stat__label">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
