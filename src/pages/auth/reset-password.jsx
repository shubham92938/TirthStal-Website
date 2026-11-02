import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiLock, FiArrowLeft, FiCheck, FiAlertCircle } from "react-icons/fi";
import { resetPasswordAPI } from "../../services/authServices";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import PasswordStrength from "../../components/auth/PasswordStrength";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const timer     = useRef(null);

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [errors,   setErrors]   = useState({});
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleReset = async (e) => {
    e.preventDefault();
    const next = {};
    if (password.length < 6)  next.password = "Use at least 6 characters";
    if (confirm !== password) next.confirm = "Passwords don't match";
    setErrors(next); setError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const data = await resetPasswordAPI(token, password);
      // The user is signed in after a reset; full reload so AuthContext picks it up
      localStorage.setItem("tirthstal_token", data.token);
      localStorage.setItem("tirthstal_user", JSON.stringify(data.user));
      setSuccess(true);
      timer.current = setTimeout(() => { navigate("/"); window.location.reload(); }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      variant="recover"
      title={success ? "Password updated" : "Set a new password"}
      subtitle={success ? null : "Choose something strong and memorable."}
      footer={!success && <Link to="/auth/login"><FiArrowLeft size={13} style={{ verticalAlign: "-2px" }} /> Back to sign in</Link>}
    >
      {success ? (
        <div className="ax-success">
          <div className="ax-success__icon"><FiCheck size={38} /></div>
          <p>You're all set and signed in.<br />Taking you home…</p>
        </div>
      ) : (
        <form onSubmit={handleReset} noValidate>
          {error && <div className="ax-alert" role="alert"><FiAlertCircle size={17} /> {error}</div>}
          <AuthField label="New password" type="password" icon={<FiLock size={18} />} autoComplete="new-password"
            value={password} onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }} error={errors.password} />
          <PasswordStrength password={password} />
          <AuthField label="Confirm new password" type="password" icon={<FiLock size={18} />} autoComplete="new-password"
            value={confirm} onChange={(v) => { setConfirm(v); setErrors((p) => ({ ...p, confirm: undefined })); }} error={errors.confirm} />
          <button type="submit" className="ax-btn" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? <><span className="ax-spin" /> Updating…</> : "Update password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
