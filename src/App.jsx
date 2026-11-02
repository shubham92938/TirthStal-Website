import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Loader from "./components/common/Loader";
import ScrollToTop from "./pages/ScrollToTop.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ScrollProgress, BackToTop } from "./components/common/PageChrome";
import { Toaster } from "react-hot-toast";
import "./styles/global/variables.css";
import "./styles/global/globals.css";
import "./styles/global/theme.css";

// ── Pages are code-split: each route loads only when visited,
//    so the first paint ships a much smaller bundle ──
const Home           = lazy(() => import("./pages/index"));
const Temples        = lazy(() => import("./pages/temples/index"));
const TempleDetail   = lazy(() => import("./pages/temples/[slug]"));
const Festivals      = lazy(() => import("./pages/festivals/index"));
const FestivalDetail = lazy(() => import("./pages/festivals/[festival]"));
const Blog           = lazy(() => import("./pages/blog/index"));
const BlogDetail     = lazy(() => import("./pages/blog/BlogDetail"));
const Favorites      = lazy(() => import("./pages/favorites/index"));
const Goseva         = lazy(() => import("./pages/goseva/index"));
const Login          = lazy(() => import("./pages/auth/login"));
const Signup         = lazy(() => import("./pages/auth/signup"));
const Profile        = lazy(() => import("./pages/auth/myprofile"));
const ForgotPassword = lazy(() => import("./pages/auth/forgotPassword"));
const ResetPassword  = lazy(() => import("./pages/auth/reset-password"));
const Legal          = lazy(() => import("./pages/Legal"));
const NotFound       = lazy(() => import("./pages/NotFound"));

// Auth screens bring their own branded layout, so the site chrome is hidden there
function Shell() {
  const { pathname } = useLocation();
  const bare = pathname.startsWith("/auth/");
  return (
    <>
      <ScrollToTop />
      <ScrollProgress />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2600,
          style: {
            background: "#3b0a0a", color: "#fff", borderRadius: "14px", fontSize: "14px",
            border: "1px solid rgba(245,184,61,.5)", boxShadow: "0 12px 30px rgba(59,10,10,.35)",
          },
          success: { iconTheme: { primary: "#f5b83d", secondary: "#3b0a0a" } },
        }}
      />
      {!bare && <Navbar />}
      <main className="app-main">
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/"                    element={<Home />}         />
          <Route path="/temples"             element={<Temples />}      />
          <Route path="/temples/:slug"       element={<TempleDetail />} />
          <Route path="/festivals"           element={<Festivals />}    />
          <Route path="/festivals/:slug"     element={<FestivalDetail />} />
          <Route path="/blog"                element={<Blog />}         />
          <Route path="/blog/:slug"          element={<BlogDetail />}   />
          <Route path="/goseva"              element={<Goseva />}       />
          <Route path="/favorites"           element={<Favorites />}    />
          <Route path="/auth/login"          element={<Login />}        />
          <Route path="/auth/signup"         element={<Signup />}       />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/forgot"                element={<ForgotPassword />} />
          <Route path="/auth/reset-password/:token" element={<ResetPassword />}  />
          <Route path="/legal/:type"        element={<Legal />}        />
          <Route path="*"                           element={<NotFound />}       />
        </Routes>
      </Suspense>
      </main>
      {!bare && <Footer />}
      {!bare && <BackToTop />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Shell />
    </Router>
  );
}
