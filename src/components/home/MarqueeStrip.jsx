import "../../styles/home/marquee.css";

const phrases = [
  "ॐ नमः शिवाय", "जय श्री राम", "जय माता दी", "हर हर महादेव",
  "जय श्री कृष्ण", "गणपति बप्पा मोरया", "जय हनुमान", "गौ माता की जय",
];

export default function MarqueeStrip() {
  const row = [...phrases, ...phrases];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row.map((p, i) => (
          <span key={i} className="marquee__item">
            <span className="marquee__star">✦</span> {p}
          </span>
        ))}
      </div>
    </div>
  );
}
