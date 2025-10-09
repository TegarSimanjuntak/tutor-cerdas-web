import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from './lib/useAuth'

const styles = `
.app-scope{ --bg:#0b1020; --panel:#0f152a; --muted:#9aa8c1; --text:#e9eef6; --line:rgba(255,255,255,.12); --accent:rgba(124,144,255,.35); }
@media (prefers-color-scheme: light){
  .app-scope{ --bg:#f7f9fd; --panel:#ffffff; --text:#0b1020; --muted:#62708a; --line:#e7ebf3; --accent:#8fa2ff; }
}
*{ box-sizing:border-box }
html,body,#root{ height:100%; }

.visually-hidden{
  position:absolute!important; left:-9999px!important; top:auto!important; width:1px!important; height:1px!important; overflow:hidden!important;
}
.visually-hidden:focus{
  position:static!important; width:auto!important; height:auto!important; padding:.5rem .75rem!important; background:#ffd80020; border:1px dashed var(--accent);
}

.app-root{ min-height:100svh; background:var(--bg); color:var(--text); display:flex; flex-direction:column; }

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
.brand{ font-weight:800; letter-spacing:.2px; margin:0; font-size:clamp(16px,2.6vw,20px); display:flex; gap:10px; align-items:center;}
.brand-badge{ font-weight:700; font-size:11px; padding:3px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted); }

/* Nav */
.nav{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.nav a{
  text-decoration:none; padding:8px 12px; border-radius:10px;
  color:var(--text); border:1px solid transparent;
  transition:background .12s ease, border-color .12s ease, transform .12s ease;
}
.nav a:hover{ background:rgba(255,255,255,.06); border-color:var(--line); transform:translateY(-1px); }
.nav a.active{ background:rgba(124,144,255,.18); border-color:var(--accent); }

/* Auth chip & button */
.auth-chip{
  display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px;
  border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--muted); font-size:12px;
}
.auth-chip b{ color:var(--text); font-weight:700; }
.btn{
  appearance:none; border:1px solid var(--line); background:rgba(255,255,255,.06);
  color:var(--text); padding:8px 12px; border-radius:10px; cursor:pointer;
  transition:background .12s ease, border-color .12s ease, transform .12s ease;
}
.btn:hover{ background:rgba(255,255,255,.1); border-color:var(--accent); transform:translateY(-1px); }
.btn:disabled{ opacity:.6; cursor:not-allowed; transform:none; }

/* Main & Footer */
.app-main{ padding:20px 0 28px; flex:1; }
.app-footer{ border-top:1px solid var(--line); padding:14px 0 32px; color:var(--muted); font-size:12px; }

/* Stack nav on small screens */
@media (max-width: 560px){
  .app-header .row{ align-items:flex-start; }
  .nav{ width:100%; justify-content:flex-start; }
}
`

export default function App() {
  const { loading, user, role, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut() // RequireAuth/route guard akan mengarahkan ke /auth
  }

  return (
    <div className="app-scope">
      <a href="#main" className="visually-hidden">Skip to content</a>
      <style>{styles}</style>

      <div className="app-root">
        <header className="app-header">
          <div className="app-container row">
            <h1 className="brand">
              Tutor Cerdas <span className="brand-badge">MVP</span>
            </h1>

            <nav className="nav" aria-label="Main navigation">
              {/* Link publik / default */}
              {!user && (
                <>
                  <NavLink to="/auth">Auth</NavLink>
                </>
              )}

              {/* Link setelah login */}
              {user && (
                <>
                  <NavLink to="/user">User</NavLink>
                  {role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
                </>
              )}

              {/* Status auth kanan */}
              <div style={{display:'flex', gap:8, alignItems:'center', marginLeft:8}}>
                {loading ? (
                  <span className="auth-chip" aria-live="polite">Memuat sesi…</span>
                ) : user ? (
                  <>
                    <span className="auth-chip" title={user.email}>
                      <span style={{
                        width:8, height:8, borderRadius:'50%',
                        background: role==='admin' ? '#7cff9d' : '#9aa8c1'
                      }} />
                      <b>{role === 'admin' ? 'Admin' : 'User'}</b>
                      <span style={{opacity:.8}}>&middot;</span>
                      <span style={{maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                        {user.email}
                      </span>
                    </span>
                    <button className="btn" type="button" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <NavLink to="/auth" className="btn">Login</NavLink>
                )}
              </div>
            </nav>
          </div>
        </header>

        {/* 
          Gunakan container untuk halaman biasa.
          Halaman full-bleed bisa override di komponennya sendiri.
        */}
        <main id="main" className="app-main app-container">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div className="app-container">
            React + Supabase Auth · Role-aware Routing · M1–M4 Skeleton
          </div>
        </footer>
      </div>
    </div>
  )
}
