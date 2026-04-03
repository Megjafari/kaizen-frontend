import { NavLink, Outlet } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function Layout() {
  const { logout } = useAuth0()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">Kaizen</span>
          <NavLink to="/" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/workouts" className={linkClass}>Workouts</NavLink>
          <NavLink to="/food" className={linkClass}>Food</NavLink>
          <NavLink to="/weight" className={linkClass}>Weight</NavLink>
          <NavLink to="/profile" className={linkClass}>Profile</NavLink>
        </div>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="px-3 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Log out
        </button>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}