import { NavLink, Outlet } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useProfile } from '../hooks/useProfile'

export default function Layout() {
  const { logout } = useAuth0()
  const { profile } = useProfile()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center w-12 h-12 rounded-full transition-all ${
      isActive 
        ? 'bg-white/10 text-white' 
        : 'text-white/40 hover:text-white/70'
    }`

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 md:pb-0">
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">Kaizen</span>
          <NavLink to="/" className={desktopLinkClass}>Dashboard</NavLink>
          <NavLink to="/workouts" className={desktopLinkClass}>Workouts</NavLink>
          <NavLink to="/food" className={desktopLinkClass}>Food</NavLink>
          <NavLink to="/weight" className={desktopLinkClass}>Weight</NavLink>
          <NavLink to="/profile" className={desktopLinkClass}>Profile</NavLink>
        </div>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="px-3 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Log out
        </button>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800">
        <span className="text-xl font-bold">Kaizen</span>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="text-sm text-zinc-400 hover:text-white"
        >
          Log out
        </button>
      </header>

      <main className="p-4">
        <Outlet />
      </main>

      {/* Mobile bottom nav - liquid glass */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-xl rounded-full px-2 py-2 flex gap-2 border border-white/5">
        <NavLink to="/" className={linkClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </NavLink>
        <NavLink to="/workouts" className={linkClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </NavLink>
        <NavLink to="/food" className={linkClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </NavLink>
        <NavLink to="/weight" className={linkClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          {profile?.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </NavLink>
      </nav>
    </div>
  )
}