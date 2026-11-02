import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scroll to the top only when the *route* changes — not on every query-string
// tweak (typing in a filter, paging, etc.), which used to yank the page around.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
