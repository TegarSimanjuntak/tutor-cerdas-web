// src/main.jsx
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import App from "./App.jsx";
import { useAuth } from "./lib/useAuth";

// Lazy load pages
const Auth = React.lazy(() => import("./pages/Auth.jsx"));
const Admin = React.lazy(() => import("./pages/Admin.jsx"));
const User = React.lazy(() => import("./pages/User.jsx"));

/* =======================
 *  Helper Components
 * ======================= */
function Loading() {
  return <div style={{ padding: 24 }}>Loading…</div>;
}

function ErrorPage({ title = "Terjadi kesalahan", detail }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>{title}</h2>
      <div style={{ opacity: 0.7 }}>{detail || "Coba muat ulang."}</div>
    </div>
  );
}

function NotFound() {
  return <ErrorPage title="404" detail="Halaman tidak ditemukan." />;
}

/* =======================
 *  Auth Guards
 * ======================= */
function RequireAuth({ children }) {
  const { loading, user } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function RequireRole({ allow, children }) {
  const { loading, role } = useAuth();
  if (loading) return <Loading />;

  // Tidak punya role yang diizinkan → redirect ke halaman sesuai role
  if (!allow.includes(role)) {
    const redirect = role === "admin" ? "/admin" : "/user";
    return <Navigate to={redirect} replace />;
  }
  return children;
}

/* =======================
 *  Redirect Root
 * ======================= */
function HomeRedirect() {
  const { loading, user, role } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth" replace />;
  return <Navigate to={role === "admin" ? "/admin" : "/user"} replace />;
}

/* =======================
 *  Router Configuration
 * ======================= */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // Root redirect
      { index: true, element: <HomeRedirect /> },

      // Auth page
      {
        path: "auth",
        element: (
          <Suspense fallback={<Loading />}>
            <Auth />
          </Suspense>
        ),
      },

      // User dashboard
      {
        path: "user",
        element: (
          <RequireAuth>
            <RequireRole allow={["user"]}>
              <Suspense fallback={<Loading />}>
                <User />
              </Suspense>
            </RequireRole>
          </RequireAuth>
        ),
      },

      // Admin dashboard
      {
        path: "admin",
        element: (
          <RequireAuth>
            <RequireRole allow={["admin"]}>
              <Suspense fallback={<Loading />}>
                <Admin />
              </Suspense>
            </RequireRole>
          </RequireAuth>
        ),
      },

      // Fallback
      { path: "*", element: <NotFound /> },
    ],
  },
]);

/* =======================
 *  Mount React App
 * ======================= */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
