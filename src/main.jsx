import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App.jsx'
import { useAuth } from './lib/useAuth'

// lazy pages
const Auth  = React.lazy(() => import('./pages/Auth.jsx'))
const Admin = React.lazy(() => import('./pages/Admin.jsx'))
const User  = React.lazy(() => import('./pages/User.jsx'))

function Loading() { return <div style={{padding:24}}>Loading…</div> }
function ErrorPage({ title='Terjadi kesalahan', detail }) {
  return <div style={{padding:24}}><h2>{title}</h2><div style={{opacity:.7}}>{detail||'Coba muat ulang.'}</div></div>
}
function NotFound() { return <ErrorPage title="404" detail="Halaman tidak ditemukan." /> }

function HomeRedirect() {
  const { loading, user, role } = useAuth()
  if (loading) return <Loading />
  if (!user)   return <Navigate to="/auth" replace />
  return <Navigate to={role === 'admin' ? '/admin' : '/user'} replace />
}

function RequireAuth({ children }) {
  const { loading, user } = useAuth()
  if (loading) return <Loading />
  if (!user)   return <Navigate to="/auth" replace />
  return children
}

function RequireRole({ allow }) {
  const { loading, role } = useAuth()
  if (loading) return <Loading />
  if (!allow.includes(role)) {
    // Kalau bukan admin, lempar ke /user
    return <Navigate to="/user" replace />
  }
  return null
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomeRedirect /> },

      { path: 'auth', element:
        <Suspense fallback={<Loading />}><Auth /></Suspense>
      },

      { path: 'user', element:
        <RequireAuth>
          <Suspense fallback={<Loading />}><User /></Suspense>
        </RequireAuth>
      },

      { path: 'admin', element:
        <RequireAuth>
          <RequireRole allow={['admin']} />
          <Suspense fallback={<Loading />}><Admin /></Suspense>
        </RequireAuth>
      },

      { path: '*', element: <NotFound /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
)
