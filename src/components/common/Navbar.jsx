import { useState, useRef, useEffect } from "react";
import { Link, useLocation }           from "react-router-dom";
import { motion, AnimatePresence }     from "framer-motion";
import {
  FiHeart, FiGlobe, FiChevronDown,
  FiUser, FiLogOut,
  FiMenu, FiX
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth }       from "../../context/AuthContext";
import { useFavorites }  from "../../context/FavoritesContext";
import "../../styles/common/navbar.css";

const navLinks = [
  { label: "Home",       key: "home",      path: "/"          },
  { label: "Temples",    key: "temples",   path: "/temples"   },
  { label: "Districts",  key: "districts", path: "/districts" },
  { label: "Festivals",  key: "festivals", path: "/festivals" },
  { label: "Goseva",     key: null,        path: "/goseva"    },
  { label: "Temple Map", key: "map",       path: "/map"       },
  { label: "Blog",       key: "blog",      path: "/blog"      },
  { label: "About Us",   key: "about",     path: "/about"     },
  { label: "Contact",    key: "contact",   path: "/contact"   },
];

const languages = [
  { code: "en", label: "English"  },
  { code: "hi", label: "हिंदी"    },
  { code: "mr", label: "मराठी"    },
  { code: "gu", label: "ગુજરાતી"  },
];

export default function Navbar() {
  const { pathname }                      = useLocation();
  const { user, isLoggedIn, logout }      = useAuth();
  const { favorites }                     = useFavorites();

  const [langOpen,     setLangOpen]     = useState(false);
  const { t, i18n }                     = useTranslation();
  const langRef                         = useRef(null);
  const activeLang = languages.find((l) => l.code === i18n.language)?.label || "English";
  const label = (link) => (link.key ? t(`nav.${link.key}`, link.label) : link.label);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const userMenuRef                     = useRef(null);

  const loginDetails = (() => {
    try { return JSON.parse(localStorage.getItem("tirthstal_user")); }
    catch { return null; }
  })();

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close user / language menus on outside click or Escape */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target))
        setLangOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") { setLangOpen(false); setUserMenuOpen(false); } };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* close drawer on route change (render-adjust pattern, no extra effect pass) */
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  /* lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">🛕</div>
          <div>
            <p className="navbar__logo-name">Tirthstal</p>
            <p className="navbar__logo-sub">Sacred Temples, Divine Journey</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`navbar__link ${pathname === link.path ? "active" : ""}`}
              >
                {label(link)}
                {pathname === link.path && (
                  <motion.span
                    className="navbar__underline"
                    layoutId="underline"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Right */}
        <div className="navbar__right">

          {/* Language */}
          <div className="navbar__lang" ref={langRef} onClick={() => setLangOpen(!langOpen)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLangOpen((o) => !o); }}>
            <FiGlobe size={16} />
            <span className="navbar__lang-text">{activeLang}</span>
            <FiChevronDown size={14} />
            <AnimatePresence>
              {langOpen && (
                <motion.ul
                  className="navbar__lang-dropdown"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                >
                  {languages.map((lang) => (
                    <li
                      key={lang.code}
                      className={activeLang === lang.label ? "selected" : ""}
                      onClick={(e) => { e.stopPropagation(); i18n.changeLanguage(lang.code); setLangOpen(false); }}
                    >
                      {lang.label}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* User Section */}
          {isLoggedIn ? (
            <div className="navbar__user" ref={userMenuRef}>
              <div
                className="navbar__user-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="navbar__user-avatar">
                  <img src="/images/AuthorImage.jpg" alt={user?.name}
                    onError={(e) => { e.target.style.display="none"; }} />
                  <span>{userInitial}</span>
                </div>
                <span className="navbar__user-name">
                  {loginDetails?.name?.split(" ")[0] || user?.name?.split(" ")[0]}
                </span>
                <FiChevronDown
                  size={14}
                  className={`navbar__user-arrow ${userMenuOpen ? "open" : ""}`}
                />
              </div>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="navbar__user-dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1   }}
                    exit={{    opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="navbar__user-dropdown-header">
                      <div className="navbar__user-dropdown-avatar">{userInitial}</div>
                      <div>
                        <p className="navbar__user-dropdown-name">{user?.name}</p>
                        <p className="navbar__user-dropdown-email">{user?.email}</p>
                      </div>
                    </div>
                    <div className="navbar__user-dropdown-divider" />
                    <Link to="/favorites" className="navbar__user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiHeart size={15} /> My Favorites
                      {favorites.length > 0 && <span className="navbar__fav-count">{favorites.length}</span>}
                    </Link>
                    <Link to="/profile" className="navbar__user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FiUser size={15} /> My Profile
                    </Link>
                    <div className="navbar__user-dropdown-divider" />
                    <button className="navbar__user-dropdown-logout" onClick={handleLogout}>
                      <FiLogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth/login" className="navbar__login-btn">{t("nav.login", "Login")}</Link>
          )}

          {/* Favorites */}
          <Link to="/favorites" className="navbar__fav-btn">
            <FiHeart size={15} />
            <span>{t("nav.favorites", "My Favorites")}</span>
            {favorites.length > 0 && (
              <span className="navbar__fav-count">{favorites.length}</span>
            )}
          </Link>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu size={24} />
        </button>
      </motion.nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="navbar__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="navbar__drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{    x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Drawer Header */}
              <div className="navbar__drawer-header">
                <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
                  <div className="navbar__logo-icon">🛕</div>
                  <div>
                    <p className="navbar__logo-name">Tirthstal</p>
                    <p className="navbar__logo-sub">Sacred Temples, Divine Journey</p>
                  </div>
                </Link>
                <button className="navbar__drawer-close" onClick={() => setMenuOpen(false)}>
                  <FiX size={22} />
                </button>
              </div>

              {/* Drawer Links */}
              <ul className="navbar__drawer-links">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={link.path}
                      className={`navbar__drawer-link ${pathname === link.path ? "active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label(link)}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Drawer Bottom */}
              <div className="navbar__drawer-bottom">
                {isLoggedIn ? (
                  <div className="navbar__drawer-user">
                    <div className="navbar__drawer-user-info">
                      <div className="navbar__user-avatar">
                        <span>{userInitial}</span>
                      </div>
                      <div>
                        <p className="navbar__user-name">{user?.name}</p>
                        <p className="navbar__user-dropdown-email">{user?.email}</p>
                      </div>
                    </div>
                    <div className="navbar__drawer-user-actions">
                      <Link to="/favorites" className="navbar__fav-btn" onClick={() => setMenuOpen(false)}>
                        <FiHeart size={15} /> My Favorites
                        {favorites.length > 0 && <span className="navbar__fav-count">{favorites.length}</span>}
                      </Link>
                      <button className="navbar__drawer-logout" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                        <FiLogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="navbar__drawer-auth">
                    <Link to="/auth/login" className="navbar__fav-btn" onClick={() => setMenuOpen(false)}>
                      Login
                    </Link>
                    <Link to="/favorites" className="navbar__drawer-fav" onClick={() => setMenuOpen(false)}>
                      <FiHeart size={15} /> My Favorites
                      {favorites.length > 0 && <span className="navbar__fav-count">{favorites.length}</span>}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}