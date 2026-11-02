import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiSend, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { forgotPasswordAPI } from "../../services/authServices";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [fieldErr, setFieldErr] = useState("");
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setFieldErr("Enter a valid email address"); return; }
    setFieldErr(""); setError(""); setLoading(true);
    try {
      await forgotPasswordAPI(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      variant="recover"
      title={sent ? "Check your inbox" : "Forgot password?"}
      subtitle={sent ? null : "Enter your email and we'll send you a link to set a new password."}
      footer={<Link to="/auth/login"><FiArrowLeft size={13} style={{ verticalAlign: "-2px" }} /> Back to sign in</Link>}
    >
      {sent ? (
        <div className="ax-success">
          <div className="ax-success__icon">📧</div>
          <p>We've sent a reset link to<br /><strong>{email}</strong></p>
          <div className="ax-note">
            ⏰ The link expires in <b>15 minutes</b><br />
            📁 Check your spam folder if you don't see it
          </div>
          <button type="button" className="ax-link-btn" onClick={() => { setSent(false); setEmail(""); }}>Didn't receive it? Try again</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="ax-alert" role="alert"><FiAlertCircle size={17} /> {error}</div>}
          <AuthField label="Email address" type="email" icon={<FiMail size={18} />} autoComplete="email" inputMode="email"
            value={email} onChange={(v) => { setEmail(v); setFieldErr(""); }} error={fieldErr} />
          <button type="submit" className="ax-btn" disabled={loading}>
            {loading ? <><span className="ax-spin" /> Sending…</> : <><FiSend size={17} /> Send reset link</>}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
