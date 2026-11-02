import { useState } from "react";
import { Link }     from "react-router-dom";
import { motion }   from "framer-motion";
import {
  FiHome, FiChevronRight, FiEdit2, FiSave,
  FiUser, FiMail, FiPhone, FiMapPin,
  FiHeart, FiSettings, FiLock,
  FiGlobe, FiLogOut
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { updateProfile } from "../../services/authServices";
import Select from "../../components/common/Select";
import { FALLBACK_IMAGE } from "../../data/store";
import "../../styles/pages/profilePage.css";

const tabs = [
  { id: "profile",   label: "My Profile",   icon: <FiUser />     },
  { id: "favorites", label: "Favorites",    icon: <FiHeart />    },
  { id: "settings",  label: "Settings",     icon: <FiSettings /> },
  { id: "security",  label: "Security",     icon: <FiLock />     },
];

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
  { value: "mr", label: "मराठी" },
  { value: "gu", label: "ગુજરાતી" },
];

const EXTRA_KEY = "tirthstal_profile_extra";
const PREFS_KEY = "tirthstal_prefs";

const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
};

const notificationPrefs = [
  { id: "festival",   label: "Festival Reminders", sub: "Get notified about upcoming festivals", on: true },
  { id: "newTemple",  label: "New Temple Added",   sub: "When a new temple is added in your area", on: true },
  { id: "newsletter", label: "Weekly Newsletter",  sub: "Weekly digest of temple news", on: false },
];

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const { i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState("profile");
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [prefs,     setPrefs]     = useState(() => readJSON(PREFS_KEY, {}));

  const extra = readJSON(EXTRA_KEY, {});
  const [form, setForm] = useState({
    name:     user?.name || "",
    email:    user?.email || "",
    phone:    extra.phone || "",
    city:     extra.city || "",
    language: user?.language || i18n.language || "en",
    bio:      extra.bio || "",
  });

  const handleChange = (field, val) =>
    setForm((p) => ({ ...p, [field]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name can't be empty"); return; }
    setSaving(true);
    try {
      // Backend stores name + language. Phone / city / bio stay on this device.
      const updated = await updateProfile({ name: form.name.trim(), language: form.language });
      updateUser({ ...updated, id: updated.id || updated._id });
      localStorage.setItem(EXTRA_KEY, JSON.stringify({ phone: form.phone, city: form.city, bio: form.bio }));
      i18n.changeLanguage(form.language);
      setEditing(false);
      toast.success("Profile updated 🙏");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your profile. Is the server running?");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm({ name: user?.name || "", email: user?.email || "", phone: extra.phone || "", city: extra.city || "",
      language: user?.language || "en", bio: extra.bio || "" });
    setEditing(false);
  };

  const togglePref = (item) => {
    const next = { ...prefs, [item.id]: !(prefs[item.id] ?? item.on) };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const favStates    = new Set(favorites.map((f) => (f.location || "").split(",").pop().trim()).filter(Boolean)).size;
  const favDeities   = new Set(favorites.map((f) => f.deity).filter(Boolean)).size;
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-page">

      {/* ── Breadcrumb ── */}
      <div className="profile-page__breadcrumb">
        <Link to="/"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} />
        <span>My Profile</span>
      </div>

      <div className="profile-page__body">

        {/* ── Left Sidebar ── */}
        <aside className="profile-sidebar">

          {/* Avatar */}
          <div className="profile-sidebar__avatar-wrap">
            <div className="profile-sidebar__avatar">
              <span>{userInitial}</span>
            </div>
          </div>

          {/* Name & Email */}
          <h2 className="profile-sidebar__name">{user?.name || "Devotee"}</h2>
          <p className="profile-sidebar__email">{user?.email || ""}</p>

          {/* Badge */}
          <span className="profile-sidebar__badge">🙏 Devotee</span>

          {/* Stats */}
          <div className="profile-sidebar__stats">
            <div className="profile-sidebar__stat">
              <span className="profile-sidebar__stat-num">{favorites.length}</span>
              <span className="profile-sidebar__stat-label">Favorites</span>
            </div>
            <div className="profile-sidebar__stat-divider" />
            <div className="profile-sidebar__stat">
              <span className="profile-sidebar__stat-num">{favDeities}</span>
              <span className="profile-sidebar__stat-label">Deities</span>
            </div>
            <div className="profile-sidebar__stat-divider" />
            <div className="profile-sidebar__stat">
              <span className="profile-sidebar__stat-num">{favStates}</span>
              <span className="profile-sidebar__stat-label">States</span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="profile-sidebar__nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`profile-sidebar__nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button className="profile-sidebar__logout" type="button" onClick={async () => { await logout(); toast.success("Logged out"); }}>
            <FiLogOut size={15} />
            Logout
          </button>

        </aside>

        {/* ── Main Content ── */}
        <main className="profile-main">

          {/* ══ TAB 1 — My Profile ══ */}
          {activeTab === "profile" && (
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3  }}
            >
              {/* Header */}
              <div className="profile-card__header">
                <h3 className="profile-card__title">Personal Information</h3>
                {editing ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="profile-card__edit-btn" type="button" onClick={cancelEdit} disabled={saving}>Cancel</button>
                    <button className="profile-card__save-btn" type="button" onClick={handleSave} disabled={saving}>
                      <FiSave size={15} /> {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <button className="profile-card__edit-btn" type="button" onClick={() => setEditing(true)}>
                    <FiEdit2 size={15} /> Edit Profile
                  </button>
                )}
              </div>


              {/* Form */}
              <div className="profile-form">

                {/* Name + Email */}
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label><FiUser size={13} /> Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={!editing}
                      className={editing ? "active" : ""}
                    />
                  </div>
                  <div className="profile-form__field">
                    <label><FiMail size={13} /> Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      readOnly
                      disabled
                      title="Email can't be changed"
                    />
                  </div>
                </div>

                {/* Phone + City */}
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label><FiPhone size={13} /> Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      disabled={!editing}
                      className={editing ? "active" : ""}
                    />
                  </div>
                  <div className="profile-form__field">
                    <label><FiMapPin size={13} /> City</label>
                    <input
                      type="text"
                      placeholder="Enter your city"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      disabled={!editing}
                      className={editing ? "active" : ""}
                    />
                  </div>
                </div>

                {/* Language */}
                <div className="profile-form__field">
                  <label><FiGlobe size={13} /> Preferred Language</label>
                  {editing ? (
                    <Select
                      value={form.language}
                      options={languages}
                      onChange={(v) => handleChange("language", v)}
                      ariaLabel="Preferred language"
                    />
                  ) : (
                    <input type="text" disabled value={languages.find((l) => l.value === form.language)?.label || "English"} />
                  )}
                </div>

                {/* Bio */}
                <div className="profile-form__field">
                  <label><FiEdit2 size={13} /> Bio</label>
                  <textarea
                    placeholder="Write something about yourself..."
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    disabled={!editing}
                    className={editing ? "active" : ""}
                    rows={3}
                  />
                </div>

              </div>

            </motion.div>
          )}

          {/* ══ TAB 2 — Favorites ══ */}
          {activeTab === "favorites" && (
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3  }}
            >
              <div className="profile-card__header">
                <h3 className="profile-card__title">My Favorite Temples</h3>
                <span className="profile-card__count">{favorites.length} temple{favorites.length === 1 ? "" : "s"}</span>
              </div>

              {favorites.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 10px" }}>
                  <p style={{ fontSize: 40 }}>🛕</p>
                  <p style={{ margin: "10px 0 18px", color: "#7a6a5e" }}>You haven't saved any temples yet.</p>
                  <Link to="/temples" className="profile-card__save-btn" style={{ display: "inline-flex", textDecoration: "none" }}>Explore Temples</Link>
                </div>
              ) : (
                <div className="profile-favorites__grid">
                  {favorites.map((t) => (
                    <div key={t.id} className="profile-fav-card">
                      <div className="profile-fav-card__img">
                        <img src={t.image || FALLBACK_IMAGE} alt={t.name} loading="lazy"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                        />
                        <button type="button" className="profile-fav-card__remove" aria-label={`Remove ${t.name} from favorites`}
                          onClick={() => { removeFavorite(t.id); toast(`Removed ${t.name}`, { icon: "💔" }); }}>
                          <FiHeart size={14} fill="currentColor" />
                        </button>
                      </div>
                      <div className="profile-fav-card__info">
                        <p className="profile-fav-card__name">{t.name}</p>
                        <p className="profile-fav-card__loc"><FiMapPin size={11} /> {t.location}</p>
                        <Link to={`/temples/${t.slug}`} className="profile-fav-card__btn">View Temple</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          )}

          {/* ══ TAB 3 — Settings ══ */}
          {activeTab === "settings" && (
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3  }}
            >
              <div className="profile-card__header">
                <h3 className="profile-card__title">Settings</h3>
              </div>

              <div className="profile-settings">

                {/* Notifications */}
                <div className="profile-settings__section">
                  <h4>🔔 Notifications</h4>
                  {notificationPrefs.map((item) => (
                    <div key={item.id} className="profile-settings__toggle-row">
                      <div>
                        <p className="profile-settings__toggle-label">{item.label}</p>
                        <p className="profile-settings__toggle-sub">{item.sub}</p>
                      </div>
                      <label className="profile-settings__toggle">
                        <input type="checkbox" checked={prefs[item.id] ?? item.on} onChange={() => togglePref(item)} />
                        <span className="profile-settings__toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>

                {/* Danger Zone */}
                <div className="profile-settings__section profile-settings__danger">
                  <h4>⚠️ Danger Zone</h4>
                  <p style={{ fontSize: 13.5, color: "#7a6a5e", margin: "0 0 12px" }}>
                    To delete your account and data, send us a request and we'll take care of it.
                  </p>
                  <Link to="/contact" className="profile-settings__delete-btn" style={{ display: "inline-block", textDecoration: "none" }}>
                    Request Account Deletion
                  </Link>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══ TAB 4 — Security ══ */}
          {activeTab === "security" && (
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3  }}
            >
              <div className="profile-card__header">
                <h3 className="profile-card__title">Security</h3>
              </div>

              <div className="profile-security">

                <div className="profile-security__section">
                  <h4>🔑 Change Password</h4>
                  <p style={{ fontSize: 14, color: "#7a6a5e", lineHeight: 1.6, marginBottom: 14 }}>
                    We'll email you a secure link to set a new password for <b>{user?.email}</b>.
                  </p>
                  <Link to="/auth/forgot" className="profile-security__save-btn" style={{ display: "inline-block", textDecoration: "none" }}>
                    Reset My Password
                  </Link>
                </div>

              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}