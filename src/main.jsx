import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import RolePicker from './pages/RolePicker.jsx'
import Admin from './pages/Admin.jsx'
import User from './pages/User.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> , children: [
    { index: true, element: <RolePicker /> },
    { path: 'admin', element: <Admin /> },
    { path: 'user', element: <User /> },
  ]},
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
