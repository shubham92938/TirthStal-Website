const LEVELS = [
  { label: "Too short", color: "#e53e3e" },
  { label: "Weak",      color: "#f59e0b" },
  { label: "Good",      color: "#3b82f6" },
  { label: "Strong",    color: "#10b981" },
];

const strengthScore = (p) => {
  if (!p) return -1;
  if (p.length < 6) return 0;
  let s = 1;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
  return Math.min(s, 3);
};

export default function PasswordStrength({ password }) {
  const score = strengthScore(password);
  if (score < 0) return null;
  const lvl = LEVELS[score];
  return (
    <div className="ax-strength" aria-live="polite">
      <div className="ax-strength__bars">
        {LEVELS.map((_, i) => <i key={i} style={i <= score ? { background: lvl.color } : undefined} />)}
      </div>
      <span style={{ color: lvl.color }}>{lvl.label}</span>
    </div>
  );
}
