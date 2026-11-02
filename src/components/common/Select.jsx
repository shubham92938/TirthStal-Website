import { useState, useRef, useEffect, useId } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import "../../styles/common/select.css";

/**
 * Accessible dropdown used by every filter on the site.
 *  - closes on outside click, Escape and after choosing
 *  - arrow keys / Enter navigation
 *  - options can be strings or { value, label }
 */
export default function Select({ value, options, onChange, className = "", placeholder = "Select", icon = null, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(-1);
  const wrapRef = useRef(null);
  const listId = useId();

  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const current = opts.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const choose = (o) => { onChange?.(o.value); setOpen(false); };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { setOpen(true); setHover(opts.findIndex((o) => o.value === value)); return; }
      setHover((h) => {
        const next = e.key === "ArrowDown" ? h + 1 : h - 1;
        return (next + opts.length) % opts.length;
      });
    }
    if ((e.key === "Enter" || e.key === " ") && open && hover >= 0) {
      e.preventDefault();
      choose(opts[hover]);
    } else if ((e.key === "Enter" || e.key === " ") && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className={`ts-select ${open ? "is-open" : ""} ${className}`} ref={wrapRef}>
      <button
        type="button"
        className="ts-select__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => { setOpen((o) => !o); setHover(opts.findIndex((o) => o.value === value)); }}
        onKeyDown={onKeyDown}
      >
        {icon && <span className="ts-select__icon">{icon}</span>}
        <span className="ts-select__value">{current?.label ?? placeholder}</span>
        <FiChevronDown size={15} className="ts-select__arrow" />
      </button>
      {open && (
        <ul className="ts-select__list" role="listbox" id={listId}>
          {opts.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`${o.value === value ? "selected" : ""} ${i === hover ? "hover" : ""}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => choose(o)}
            >
              <span>{o.label}</span>
              {o.value === value && <FiCheck size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
