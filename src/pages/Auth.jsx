import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'

export default function AuthPage() {
  const nav = useNavigate()
  const { user, role } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  // Jika sudah login, langsung kirim ke page role
  if (user && role) {
    if (role === 'admin') nav('/admin')
    else nav('/user')
  }

  const onRegister = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      // signUp
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      // Supabase: kalau Email Confirm ON, user harus cek email.
      // Kita tidak menentukan role dari FE (admin dibuat manual dari DB).
      // Agar profil ada, kita boleh upsert saat user aktif (kalau sudah langsung login).
      const newUser = data.user
      if (newUser) {
        await supabase
          .from('profiles')
          .upsert({ id: newUser.id, role: 'user' }, { onConflict: 'id' })
      }

      setMsg('Registrasi berhasil. Jika verifikasi email aktif, cek inbox untuk konfirmasi.')
      setMode('login')
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Pastikan profil ada & role default 'user'
      const uid = data.user.id
      await supabase.from('profiles').upsert({ id: uid, role: 'user' }, { onConflict: 'id' })

      // Ambil role untuk redirect
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', uid).single()
      const r = prof?.role === 'admin' ? 'admin' : 'user'
      nav(r === 'admin' ? '/admin' : '/user')
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-root" style={rootStyle}>
      <div style={cardStyle}>
        <h2 style={{margin:'0 0 6px'}}>Masuk ke Tutor Cerdas</h2>
        <div style={{opacity:.7, marginBottom:16}}>Gunakan email & password Supabase Auth</div>

        <div style={tabsStyle}>
          <button
            onClick={() => setMode('login')}
            style={{...tabBtn, ...(mode==='login'?tabActive:{})}}
          >Login</button>
          <button
            onClick={() => setMode('register')}
            style={{...tabBtn, ...(mode==='register'?tabActive:{})}}
          >Register (user)</button>
        </div>

        <form onSubmit={mode==='login' ? onLogin : onRegister} style={{display:'grid', gap:12}}>
          <label style={labelStyle}>
            <span>Email</span>
            <input
              required type="email" value={email}
              onChange={e=>setEmail(e.target.value)} style={inputStyle}
              placeholder="you@example.com"
            />
          </label>

          <label style={labelStyle}>
            <span>Password</span>
            <input
              required type="password" value={password}
              onChange={e=>setPassword(e.target.value)} style={inputStyle}
              placeholder="••••••••"
            />
          </label>

          {msg && <div style={msgStyle}>{msg}</div>}

          <button disabled={loading} type="submit" style={submitBtn}>
            {loading ? 'Processing…' : (mode==='login' ? 'Login' : 'Register')}
          </button>

          {mode === 'register' && (
            <p style={{fontSize:12, opacity:.7, marginTop:4}}>
              Pendaftaran ini otomatis sebagai <b>user</b>. <br/>
              Role <b>admin</b> di-set manual dari database.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

/* ====== Styles (sederhana, no Tailwind) ====== */
const rootStyle = {
  minHeight:'100svh', display:'grid', placeItems:'center',
  background:'linear-gradient(135deg,#0b1020,#0f152a)', color:'#e9eef6', padding:16
}
const cardStyle = {
  width:'min(420px, 92vw)', background:'rgba(255,255,255,0.06)',
  border:'1px solid rgba(255,255,255,.12)', borderRadius:12, padding:20
}
const tabsStyle = { display:'flex', gap:8, marginBottom:16 }
const tabBtn = {
  flex:1, padding:'10px 12px', background:'transparent',
  border:'1px solid rgba(255,255,255,.2)', borderRadius:8, color:'#e9eef6', cursor:'pointer'
}
const tabActive = { background:'rgba(255,255,255,.1)' }
const labelStyle = { display:'grid', gap:6, fontSize:14 }
const inputStyle = {
  padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,.2)',
  background:'rgba(0,0,0,.2)', color:'#e9eef6', outline:'none'
}
const submitBtn = {
  marginTop:8, padding:'10px 12px', borderRadius:8, border:'1px solid transparent',
  background:'#6c9ef8', color:'#0b1020', fontWeight:600, cursor:'pointer'
}
const msgStyle = { background:'rgba(0,0,0,.25)', border:'1px solid rgba(255,255,255,.15)',
  borderRadius:8, padding:'8px 10px', fontSize:13 }
