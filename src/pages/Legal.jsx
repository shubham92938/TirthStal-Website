import { Link, useParams, Navigate } from "react-router-dom";
import { FiHome, FiChevronRight } from "react-icons/fi";
import { SITE } from "../config/site";
import "../styles/pages/legal.css";

const sitemap = [
  ["Explore", [["Home", "/"], ["All Temples", "/temples"], ["Festivals", "/festivals"]]],
  ["Serve & Learn", [["Goseva", "/goseva"], ["Blog & Stories", "/blog"]]],
  ["Your account", [["Login", "/auth/login"], ["Sign up", "/auth/signup"], ["My Favorites", "/favorites"], ["My Profile", "/profile"]]],
  ["Legal", [["Privacy Policy", "/legal/privacy"], ["Terms of Service", "/legal/terms"]]],
];

const pages = {
  privacy: {
    title: "Privacy Policy",
    body: [
      ["What we collect", "When you create an account we store your name, email address and a securely hashed password. Your saved temples are kept in your browser. If you write to us or subscribe to updates we keep the details you submit so we can reply."],
      ["How we use it", "Only to run Tirthstal — signing you in, remembering your favorites, answering your messages and sending festival updates you asked for. We do not sell your personal information."],
      ["Cookies & storage", "We use your browser’s local storage to keep you signed in, remember your language and save favorites. You can clear it any time from your browser settings."],
      ["Your choices", `You can ask us to correct or delete your data by writing to ${SITE.email}.`],
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      ["Using Tirthstal", "Tirthstal is a guide to temples, festivals and Goseva. Information is shared in good faith; timings, rituals and entry rules can change, so please confirm with the temple before you travel."],
      ["Your account", "Keep your password safe and give accurate details. You are responsible for activity on your account."],
      ["Goseva pledges", "A pledge is an intention to support a gaushala. Please confirm the details directly with the gaushala before sending any contribution."],
      ["Respect", "Please keep reviews and messages respectful of all devotees and traditions."],
    ],
  },
};

export default function Legal() {
  const { type } = useParams();
  const isMap = type === "sitemap";
  const page = pages[type];
  if (!isMap && !page) return <Navigate to="/404" replace />;

  return (
    <div className="legal">
      <div className="legal__crumb">
        <Link to="/"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} />
        <span>{isMap ? "Sitemap" : page.title}</span>
      </div>
      <h1 className="legal__title">{isMap ? "Sitemap" : page.title}</h1>

      {isMap ? (
        <div className="legal__map">
          {sitemap.map(([group, links]) => (
            <div key={group} className="legal__card">
              <h3>{group}</h3>
              <ul>{links.map(([label, to]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="legal__body">
          {page.body.map(([h, p]) => (
            <section key={h}><h3>{h}</h3><p>{p}</p></section>
          ))}
          <p className="legal__updated">Last updated: November 2026</p>
        </div>
      )}
    </div>
  );
}
