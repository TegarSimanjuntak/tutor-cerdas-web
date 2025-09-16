import { Outlet, NavLink } from 'react-router-dom'

const styles = `
.app-scope{ --bg:#0b1020; --panel:#0f152a; --muted:#9aa8c1; --text:#e9eef6; --line:rgba(255,255,255,.12); }
@media (prefers-color-scheme: light){
  .app-scope{ --bg:#f7f9fd; --panel:#ffffff; --text:#0b1020; --muted:#62708a; --line:#e7ebf3; }
}
*{ box-sizing:border-box }

.app-root{ min-height:100svh; background:var(--bg); color:var(--text); }

.app-container{ width:min(1100px, 92vw); margin:0 auto; }

/* Header */
.app-header{
  position:sticky; top:0; z-index:50;
  background:rgba(10,14,28,.6);
  backdrop-filter: blur(10px);
  border-bottom:1px solid var(--line);
}
.app-header .row{
  display:flex; align-items:center; justify-content:space-between;
  gap:16px; padding:14px 0;
}
.brand{ font-weight:800; letter-spacing:.2px; margin:0; font-size:clamp(16px,2.6vw,20px); }

.nav{ display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
.nav a{
  text-decoration:none; padding:8px 12px; border-radius:10px;
  color:var(--text); border:1px solid transparent;
  transition:background .12s ease, border-color .12s ease, transform .12s ease;
}
.nav a:hover{ background:rgba(255,255,255,.06); border-color:var(--line); transform:translateY(-1px); }
.nav a.active{ background:rgba(124,144,255,.18); border-color:rgba(124,144,255,.35); }

/* Main & Footer */
.app-main{ padding:20px 0 28px; }
.app-footer{ border-top:1px solid var(--line); padding:14px 0 32px; color:var(--muted); font-size:12px; }
`

export default function App() {
  return (
    <div className="app-scope">
      <style>{styles}</style>

      <div className="app-root">
        <header className="app-header">
          <div className="app-container row">
            <h1 className="brand">Tutor Cerdas (MVP)</h1>
            <nav className="nav" aria-label="Main navigation">
              <NavLink to="/" end>Role Picker</NavLink>
              <NavLink to="/admin">Admin</NavLink>
              <NavLink to="/user">User</NavLink>
            </nav>
          </div>
        </header>

        {/* 
          Gunakan container untuk halaman biasa.
          Halaman yang perlu full-bleed (RolePicker) tetap bisa "break out"
          karena dia memakai margin-left: calc(50% - 50vw).
        */}
        <main className="app-main app-container">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div className="app-container">
            M1–M4 Skeleton • React + Express + Supabase
          </div>
        </footer>
      </div>
    </div>
  )
}
