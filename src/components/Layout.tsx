import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout() {
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center w-12 h-12 rounded-full transition-all ${
      isActive 
        ? 'bg-white/10 text-white' 
        : 'text-white/40 hover:text-white/70'
    }`

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800'}`

  function handleQuickAction(action: string) {
    setShowQuickAdd(false)
    navigate(`/${action}?quick=true`)
  }

  return (
    <div className="min-h-screen text-white pb-24 md:pb-0">
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-shadow">Kaizen</span>
          <NavLink to="/" className={desktopLinkClass}>Dashboard</NavLink>
          <NavLink to="/workouts" className={desktopLinkClass}>Workouts</NavLink>
          <NavLink to="/food" className={desktopLinkClass}>Food</NavLink>
          <NavLink to="/profile" className={desktopLinkClass}>Profile</NavLink>
        </div>
      </nav>

      <main className="p-4">
        <Outlet />
      </main>

      {/* Quick Add Overlay */}
      <AnimatePresence>
        {showQuickAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowQuickAdd(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3"
            >
              <button
                onClick={() => handleQuickAction('weight')}
                className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900">Log Weight</span>
              </button>

              <button
                onClick={() => handleQuickAction('food')}
                className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900">Log Food</span>
              </button>

              <button
                onClick={() => handleQuickAction('workouts')}
                className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg"
              >
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-900">Log Workout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl rounded-full px-2 py-2 flex gap-2 border border-white/10 z-50">
        <NavLink to="/" className={linkClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </NavLink>
      <NavLink to="/workouts" className={linkClass}>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <rect x="1" y="10" width="4" height="4" rx="1" />
          <rect x="19" y="10" width="4" height="4" rx="1" />
          <rect x="5" y="8" width="3" height="8" rx="1" />
          <rect x="16" y="8" width="3" height="8" rx="1" />
          <rect x="8" y="11" width="8" height="2" rx="0.5" />
        </svg>
      </NavLink>
        
        {/* Plus Button */}
        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
            showQuickAdd 
              ? 'bg-cyan-500 text-white rotate-45' 
              : 'bg-cyan-500 text-white'
          }`}
        >
          <svg className="w-6 h-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        <NavLink to="/food" className={linkClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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