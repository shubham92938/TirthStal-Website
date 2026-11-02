import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import PasswordStrength from "../../components/auth/PasswordStrength";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,  setErrors]  = useState({});
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim())                 next.name = "Tell us your name";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address";
    if (form.password.length < 6)          next.password = "Use at least 6 characters";
    if (form.confirm !== form.password)    next.confirm = "Passwords don't match";
    setErrors(next);
    setError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      // registering also signs the user in (the service stores the token)
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success("Welcome to Tirthstal 🙏");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      variant="signup"
      title="Create account"
      subtitle="It takes less than a minute — and it's free."
      footer={<>Already have an account? <Link to="/auth/login">Sign in</Link></>}
    >
      <form onSubmit={handleSignup} noValidate>
        {error && <div className="ax-alert" role="alert"><FiAlertCircle size={17} /> {error}</div>}

        <AuthField label="Full name" icon={<FiUser size={18} />} autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} />
        <AuthField label="Email address" type="email" icon={<FiMail size={18} />} autoComplete="email" inputMode="email" value={form.email} onChange={set("email")} error={errors.email} />
        <AuthField label="Password" type="password" icon={<FiLock size={18} />} autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} />
        <PasswordStrength password={form.password} />
        <AuthField label="Confirm password" type="password" icon={<FiLock size={18} />} autoComplete="new-password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />

        <button type="submit" className="ax-btn" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? <><span className="ax-spin" /> Creating account…</> : <>Create account <FiArrowRight size={18} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
