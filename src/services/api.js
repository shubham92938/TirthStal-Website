import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  // Render's free plan sleeps when idle and can take ~30-60s to wake up, so allow for that
  timeout: 60000,
});

// ── Request interceptor: har request me JWT attach karo ──
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tirthstal_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: session expire (401) pe logout + login page ──
// Lekin: galat password par login API bhi 401 deti hai — wahan redirect
// karne se page reload ho jata tha aur error message gayab ho jata tha.
// Isliye auth pages / login-register calls par redirect skip karo,
// error ko form tak jaane do.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthCall =
        url.includes("/auth/login") || url.includes("/auth/register");
      const onAuthPage = window.location.pathname.startsWith("/auth/");

      if (!isAuthCall && !onAuthPage) {
        localStorage.removeItem("tirthstal_token");
        localStorage.removeItem("tirthstal_user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;

// Fire-and-forget request that wakes a sleeping backend (Render free tier) while the user
// is still looking at the page, so login/signup don't hit a cold start.
export const warmUpApi = () => {
  fetch(`${API.defaults.baseURL}/health`, { method: "GET", mode: "cors", cache: "no-store" }).catch(() => {});
};
