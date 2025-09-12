import { Link } from 'react-router-dom'

export default function RolePicker() {
  return (
    <div style={{display:'grid', gap:12}}>
      <h2>Pilih peran (MVP)</h2>
      <p>Untuk MVP, bebas pilih halaman:</p>
      <div style={{display:'flex', gap:12}}>
        <Link to="/admin"><button>Masuk Admin</button></Link>
        <Link to="/user"><button>Masuk User</button></Link>
      </div>
    </div>
  )
}
