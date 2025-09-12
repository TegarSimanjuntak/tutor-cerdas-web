import { useState } from 'react'

export default function User() {
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  async function ask() {
    if(!q.trim()) return
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/chat/ask', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ question: q, role: 'user' })
      })
      const data = await res.json()
      setAnswer(data?.answer ?? '(no answer)')
    } catch (e) {
      setAnswer('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <h2>User Page</h2>
      <input
        value={q}
        onChange={e=>setQ(e.target.value)}
        placeholder="Tanya sesuatu..."
        style={{padding:8}}
      />
      <button onClick={ask} disabled={loading}>
        {loading ? 'Memproses...' : 'Tanya'}
      </button>
      {answer && (
        <div style={{whiteSpace:'pre-wrap', padding:12, border:'1px solid #ddd', borderRadius:8}}>
          {answer}
        </div>
      )}
    </div>
  )
}
