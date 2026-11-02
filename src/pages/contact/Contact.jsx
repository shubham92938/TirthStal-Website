import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome, FiChevronRight, FiPhone, FiMail,
  FiGlobe, FiClock, FiMapPin, FiSend, FiMessageCircle
} from "react-icons/fi";
import {
  FaFacebookF, FaInstagram, FaYoutube, FaXTwitter
} from "react-icons/fa6";
import toast from "react-hot-toast";
import Select from "../../components/common/Select";
import { SITE, SOCIALS } from "../../config/site";
import { sendContactMessage, isEmail } from "../../services/outreachService";
import "../../styles/pages/contact.css";

const subjects = [
  "General Inquiry",
  "Temple Information",
  "Festival Information",
  "Report an Issue",
  "Suggest a Temple",
  "Partnership",
  "Other",
];

const contactInfo = [
  { icon: <FiPhone />,   text: SITE.phone,  href: `tel:${SITE.phone.replace(/[^\d+]/g, "")}` },
  { icon: <FiMail />,    text: SITE.email,  href: `mailto:${SITE.email}` },
  { icon: <FiGlobe />,   text: "www.tirthstal.com" },
  { icon: <FiClock />,   text: "Monday - Saturday: 9:00 AM - 6:00 PM" },
  { icon: <FiMapPin />,  text: "Tirthstal, 123 Temple Road,\nUjjain, Madhya Pradesh 456006, India",
    href: "https://www.google.com/maps/search/?api=1&query=Ujjain+Madhya+Pradesh" },
];

const socials = [
  { icon: <FaFacebookF />,  color: "#1877f2", label: "Facebook",  href: SOCIALS.facebook  },
  { icon: <FaInstagram />,  color: "#e1306c", label: "Instagram", href: SOCIALS.instagram },
  { icon: <FaYoutube />,    color: "#ff0000", label: "YouTube",   href: SOCIALS.youtube   },
  { icon: <FaXTwitter />,   color: "#000000", label: "X",         href: SOCIALS.twitter   },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", subject: "", message: ""
  });
  const [notRobot,    setNotRobot]    = useState(false);
  const [errors,      setErrors]      = useState({});
  const [submitted,   setSubmitted]   = useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitted(false);
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const next = {};
    if (!form.name.trim())          next.name = "Please tell us your name";
    if (!isEmail(form.email))       next.email = "Enter a valid email address";
    if (!form.subject)              next.subject = "Choose a subject";
    if (form.message.trim().length < 10) next.message = "Message should be at least 10 characters";
    if (!notRobot)                  next.consent = "Please tick the box so we can reply to you";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error(Object.values(next)[0]);
      return;
    }
    setLoading(true);
    try {
      const { delivered } = await sendContactMessage({ ...form, name: form.name.trim(), email: form.email.trim() });
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setNotRobot(false);
      toast.success(delivered ? "Message sent — thank you 🙏" : "Message saved — thank you 🙏");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => setErrors((p) => ({ ...p, [field]: undefined }));

  return (
    <div className="contact-page">

      {/* ── Breadcrumb ── */}
      <div className="contact-page__breadcrumb">
        <Link to="/"><FiHome size={13} /> Home</Link>
        <FiChevronRight size={13} />
        <span>Contact Us</span>
      </div>

      {/* ── Header ── */}
      <div className="contact-page__header">
        <div className="contact-page__header-left">
          <motion.h1
            className="contact-page__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="contact-page__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            We'd love to hear from you! Whether you have a question,<br />
            suggestion or feedback, our team is here to help.
          </motion.p>
        </div>
        <div className="contact-page__header-img">
          <img
            src="https://images.unsplash.com/photo-1548013146-72479768bada?w=900"
            alt="Temple"
            onError={(e) => e.target.style.display = "none"}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="contact-page__body">

        {/* ── Left — Form ── */}
        <div className="contact-form">
          <h2 className="contact-form__title">Send Us a Message</h2>

          {/* Name + Email */}
          <div className="contact-form__row">
            <div className="contact-form__field">
              <label>Your Name <span>*</span></label>
              <input
                type="text"
                aria-invalid={!!errors.name}
                className={errors.name ? "has-error" : ""}
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="contact-form__error">{errors.name}</p>}
            </div>
            <div className="contact-form__field">
              <label>Email Address <span>*</span></label>
              <input
                type="email"
                aria-invalid={!!errors.email}
                className={errors.email ? "has-error" : ""}
                placeholder="Enter your email address"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <p className="contact-form__error">{errors.email}</p>}
            </div>
          </div>

          {/* Subject */}
          <div className="contact-form__field">
            <label>Subject <span>*</span></label>
            <Select
              value={form.subject}
              options={subjects}
              placeholder="Select a subject"
              onChange={(v) => handleChange("subject", v)}
              ariaLabel="Subject"
            />
            {errors.subject && <p className="contact-form__error">{errors.subject}</p>}
          </div>

          {/* Message */}
          <div className="contact-form__field">
            <label>Message <span>*</span></label>
            <textarea
              placeholder="Write your message here..."
              rows={6}
              value={form.message}
              className={errors.message ? "has-error" : ""}
              onChange={(e) => handleChange("message", e.target.value)}
            />
            {errors.message && <p className="contact-form__error">{errors.message}</p>}
          </div>

          {/* Captcha + Submit */}
          <div className="contact-form__bottom">
            <label className="contact-form__consent">
              <input type="checkbox" checked={notRobot} onChange={(e) => { setNotRobot(e.target.checked); clearError("consent"); }} />
              <span>I agree to be contacted about my message</span>
            </label>
            {errors.consent && <p className="contact-form__error">{errors.consent}</p>}

            {/* Submit Button */}
            <button
              className="contact-form__submit"
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="contact-form__loading">Sending...</span>
              ) : (
                <>
                  <FiSend size={15} />
                  Send Message
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {submitted && (
            <motion.div
              className="contact-form__success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✅ Message sent successfully! We'll get back to you within 24-48 hours.
            </motion.div>
          )}

          {/* Response Note */}
          <div className="contact-form__note">
            <div className="contact-form__note-icon">
              <FiMail size={18} />
            </div>
            <div>
              <p>We usually respond within 24-48 hours.</p>
              <p>Thank you for being a part of Tirthstal!</p>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="contact-sidebar">

          {/* Contact Info */}
          <div className="contact-sidebar__card">
            <h3 className="contact-sidebar__title">Contact Information</h3>
            <div className="contact-sidebar__divider" />
            <div className="contact-sidebar__info-list">
              {contactInfo.map((item, i) => (
                <div key={i} className="contact-sidebar__info-item">
                  <div className="contact-sidebar__info-icon">{item.icon}</div>
                  <p className="contact-sidebar__info-text"
                    style={{ whiteSpace: "pre-line" }}>
                    {item.href
                      ? <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{item.text}</a>
                      : item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Follow Us */}
          <div className="contact-sidebar__card">
            <h3 className="contact-sidebar__title">Follow Us</h3>
            <div className="contact-sidebar__divider" />
            <div className="contact-sidebar__socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-sidebar__social-btn"
                  style={{ background: s.color }}
                  title={s.label}
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="contact-sidebar__card">
            <h3 className="contact-sidebar__title">We Value Your Feedback</h3>
            <div className="contact-sidebar__divider" />
            <p className="contact-sidebar__feedback-text">
              Your feedback helps us improve and bring you the best experience.
            </p>
            <button
              type="button"
              className="contact-sidebar__feedback-btn"
              onClick={() => {
                handleChange("subject", "General Inquiry");
                setForm((p) => ({ ...p, subject: "General Inquiry", message: p.message || "Feedback: " }));
                document.querySelector(".contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <FiMessageCircle size={14} />
              Share Your Feedback
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}