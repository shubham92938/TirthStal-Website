import API from "./api";

// The backend does not expose /newsletter yet. Until it does,
// submissions fall back to a local outbox so nothing the visitor typed is
// lost and the UI can still give honest feedback.
const OUTBOX_KEY = "tirthstal_outbox";

const queue = (kind, payload) => {
  try {
    const box = JSON.parse(localStorage.getItem(OUTBOX_KEY)) || [];
    box.push({ kind, payload, at: new Date().toISOString() });
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(box.slice(-50)));
  } catch { /* storage unavailable */ }
};

const send = async (kind, path, payload) => {
  try {
    await API.post(path, payload);
    return { delivered: true };
  } catch (err) {
    // Real validation errors from the server should surface to the user
    if (err.response && err.response.status >= 400 && err.response.status < 500 && err.response.status !== 404) {
      throw new Error(err.response.data?.message || "Please check your details and try again.", { cause: err });
    }
    queue(kind, payload);
    return { delivered: false };
  }
};

export const subscribeNewsletter = (email) => send("newsletter", "/newsletter", { email });

export const isEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
