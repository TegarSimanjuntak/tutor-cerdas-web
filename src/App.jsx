import { Outlet, Link } from 'react-router-dom'

export default function App() {
  return (
    <div style={{fontFamily:'system-ui', padding: 16, maxWidth: 900, margin: '0 auto'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{fontSize: 20, margin:0}}>Tutor Cerdas (MVP)</h1>
        <nav style={{display:'flex', gap:12}}>
          <Link to="/">Role Picker</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/user">User</Link>
        </nav>
      </header>
      <Outlet />
      <footer style={{marginTop:24, fontSize:12, opacity:.7}}>M1 Skeleton • React + Express</footer>
    </div>
  )
}
