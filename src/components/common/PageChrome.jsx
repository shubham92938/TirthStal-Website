import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { FiArrowUp } from "react-icons/fi";

/** Thin gold progress bar at the very top that fills as you scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.3 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

/** Floating button that appears after scrolling and returns to the top. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <motion.button
      type="button"
      className="to-top"
      aria-label="Back to top"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <FiArrowUp />
    </motion.button>
  );
}
