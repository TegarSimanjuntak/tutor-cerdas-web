// src/lib/api.js
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  // ambil token dari session
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token || sessionData?.session?.accessToken || sessionData?.access_token || null;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let body;
    try { body = await res.json(); } catch { body = null; }
    const msg = (body && (body.error || body.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json().catch(() => null);
}
