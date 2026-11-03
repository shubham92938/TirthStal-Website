/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
} from "../services/authServices";




// Turn an axios error into a message the user can act on.
// No `response` means the request never reached the API (wrong API URL, server down, CORS, no internet).
const authErrorMessage = (err, fallback) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (!err.response) return "Can't reach the server right now. Please check your connection and try again in a moment.";
  return fallback;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginService(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = authErrorMessage(err, "Login failed");
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registerService(name, email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = authErrorMessage(err, "Registration failed");
      setError(msg);
      throw new Error(msg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const updateUser = (next) => {
    setUser((prev) => {
      const merged = { ...prev, ...next, id: next?.id || next?._id || prev?.id };
      localStorage.setItem("tirthstal_user", JSON.stringify(merged));
      return merged;
    });
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isLoggedIn: !!user,
      login,
      register,
      logout,
      clearError,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};