import { useState, useId } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

/** Floating-label input with leading icon and optional password toggle. */
export default function AuthField({ label, icon, type = "text", value, onChange, error, autoComplete, name, right, ...rest }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPass = type === "password";

  return (
    <div className={`axf ${error ? "has-error" : ""}`}>
      <div className="axf__box">
        {icon && <span className="axf__icon">{icon}</span>}
        <input
          id={id}
          name={name}
          type={isPass && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          autoComplete={autoComplete}
          aria-invalid={!!error}
          {...rest}
        />
        <label htmlFor={id}>{label}</label>
        {isPass && (
          <button type="button" className="axf__eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        )}
        {right}
      </div>
      {error && <p className="axf__error">{error}</p>}
    </div>
  );
}
