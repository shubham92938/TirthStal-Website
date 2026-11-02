import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [errors,   setErrors]   = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address";
    if (!password) next.password = "Enter your password";
    setErrors(next);
    setError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back 🙏");
      const from = location.state?.from;
      navigate(from ? `${from.pathname}${from.search || ""}` : "/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      variant="login"
      title="Welcome back"
      subtitle="Sign in to see your saved temples and festival reminders."
      footer={<>New to Tirthstal? <Link to="/auth/signup">Create an account</Link></>}
    >
      <form onSubmit={handleLogin} noValidate>
        {error && <div className="ax-alert" role="alert"><FiAlertCircle size={17} /> {error}</div>}

        <AuthField label="Email address" type="email" icon={<FiMail size={18} />} autoComplete="email" inputMode="email"
          value={email} onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }} error={errors.email} />
        <AuthField label="Password" type="password" icon={<FiLock size={18} />} autoComplete="current-password"
          value={password} onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }} error={errors.password} />

        <div className="ax-row" style={{ justifyContent: "flex-end" }}>
          <Link to="/auth/forgot">Forgot password?</Link>
        </div>

        <button type="submit" className="ax-btn" disabled={loading}>
          {loading ? <><span className="ax-spin" /> Signing in…</> : <>Sign in <FiArrowRight size={18} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
