import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)

  // session listener
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session ?? null)
      setLoading(false)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s)
    })
    return () => sub.subscription?.unsubscribe()
  }, [])

  // fetch role dari tabel profiles (id = auth.user.id)
  useEffect(() => {
    if (!session?.user) { setRole(null); return }
    ;(async () => {
      const userId = session.user.id
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('[useAuth] gagal ambil role:', error.message)
        setRole('user') // fallback aman
      } else {
        setRole(data?.role || 'user')
      }
    })()
  }, [session?.user?.id])

  const signOut = async () => {
    await supabase.auth.signOut()
    setRole(null)
  }

  return { loading, session, user: session?.user ?? null, role, signOut }
}
