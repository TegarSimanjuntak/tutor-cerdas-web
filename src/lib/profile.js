// src/lib/profile.js
import { supabase } from './supabase';

/**
 * Pastikan profil user ada SEKALI saja.
 * Jangan pernah mengirim field 'role' dari client.
 */
export async function ensureProfileOnce() {
  const { data: userData } = await supabase.auth.getUser();

  const user = userData?.user || userData; // support v1/v2
  if (!user?.id) return null;

  // cek apakah sudah ada
  const { data: existing, error: selErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) return existing;

  // insert sekali (tanpa role)
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? null,
      created_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) {
    // jika konflik (saat trigger handle_new_user sudah bikin), ignore
    console.warn('[profiles] insert warn:', error);
    return null;
  }
  return data;
}
