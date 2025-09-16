import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'

// Lazy-load pages (bundle lebih kecil)
const RolePicker = React.lazy(() => import('./pages/RolePicker.jsx'))
const Admin      = React.lazy(() => import('./pages/Admin.jsx'))
const User       = React.lazy(() => import('./pages/User.jsx'))

// Basename (jaga-jaga kalau nanti app dipasang di subpath)
// Vite expose BASE_URL saat build; VITE_BASE_PATH opsional dari .env
const basename =
  (import.meta.env.BASE_URL?.replace(/\/+$/, '')) ||
  (import.meta.env.VITE_BASE_PATH || '').replace(/\/+$/, '')

// Komponen kecil untuk error & 404
function ErrorPage({ title = 'Terjadi kesalahan', detail }) {
  return (
    <div style={{padding:24}}>
      <h2 style={{margin:'0 0 6px'}}>{title}</h2>
      <div style={{opacity:.7}}>{detail || 'Silakan coba muat ulang halaman.'}</div>
    </div>
  )
}
function NotFound() {
  return <ErrorPage title="404 - Halaman tidak ditemukan" detail="Cek kembali URL yang kamu akses." />
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <RolePicker /> },
        { path: 'admin', element: <Admin /> },
        { path: 'user',  element: <User /> },
        { path: '*',     element: <NotFound /> },
      ],
    },
  ],
  { basename }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div style={{padding:24}}>Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
)
