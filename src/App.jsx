// src/App.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./lib/useAuth";

/* ===== Styles ===== */
const styles = `
.app-scope{ --bg:#0b1020; --panel:#0f152a; --muted:#9aa8c1; --text:#e9eef6; --line:rgba(255,255,255,.12); --accent:rgba(124,144,255,.35); }
@media (prefers-color-scheme: light){
  .app-scope{ --bg:#f7f9fd; --panel:#ffffff; --text:#0b1020; --muted:#62708a; --line:#e7ebf3; --accent:#8fa2ff; }
}
*{ box-sizing:border-box }
html,body,#root{ height:100%; margin:0; }
.app-root{ min-height:100svh; background:var(--bg); color:var(--text); display:flex; flex-direction:column; }
.app-header{ position:sticky; top:0; z-index:50; background:rgba(10,14,28,.6); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
.app-header .row{ display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 0; width:min(1100px,92vw); margin:0 auto; }
.brand{ font-weight:800; letter-spacing:.2px; margin:0; font-size:clamp(16px,2.6vw,20px); display:flex; gap:10px; align-items:center;}
.brand-badge{ font-weight:700; font-size:11px; padding:3px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted); }
.auth-chip{ display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--muted); font-size:12px; }
.auth-chip b{ color:var(--text); font-weight:700; }
.btn{ appearance:none; border:1px solid var(--line); background:rgba(255,255,255,.06); color:var(--text); padding:8px 12px; border-radius:10px; cursor:pointer; transition:background .12s ease,border-color .12s ease,transform .12s ease; }
.btn:hover{ background:rgba(255,255,255,.1); border-color:var(--accent); transform:translateY(-1px); }
.app-main{ flex:1; padding:24px 0; width:min(1100px,92vw); margin:0 auto; }
.app-footer{ border-top:1px solid var(--line); padding:14px 0 32px; color:var(--muted); font-size:12px; width:min(1100px,92vw); margin:0 auto; }
`;

/* ===== Header component ===== */
function Header() {
  const { user, role, loading, signOut } = useAuth();

  return (
    <header className="app-header">
      <div className="row">
        <h1 className="brand">
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Tutor Cerdas <span className="brand-badge">MVP</span>
          </Link>
        </h1>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {loading ? (
            <span className="auth-chip">Memuat sesi…</span>
          ) : user ? (
            <>
              <span className="auth-chip" title={user.email}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: role === "admin" ? "#7cff9d" : "#9aa8c1",
                  }}
                />
                <b>{role === "admin" ? "Admin" : "User"}</b>
                <span style={{ opacity: 0.8 }}>&middot;</span>
                <span
                  style={{
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </span>
              </span>
              <button className="btn" onClick={signOut}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn" style={{ textDecoration: "none", color: "inherit" }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/* ===== App layout (simple) ===== */
export default function App() {
  return (
    <div className="app-scope">
      <style>{styles}</style>
      <div className="app-root">
        <Header />

        <main id="main" className="app-main">
          {/* Halaman anak dirender oleh router di main.jsx */}
          <Outlet />
        </main>

        <footer className="app-footer">
          React + Supabase Auth · Role-aware Routing · MVP Framework
        </footer>
      </div>
    </div>
  );
}
