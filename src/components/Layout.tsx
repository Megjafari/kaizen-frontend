import { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useApi } from '../hooks/useApi'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout() {
  const { profile } = useProfile()
  const { fetchWithAuth } = useApi()
  const navigate = useNavigate()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weight, setWeight] = useState('')
  const [todaysWeight, setTodaysWeight] = useState<{ id: number; weight: number } | null>(null)
  const [savingWeight, setSavingWeight] = useState(false)

  const loadTodaysWeight = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const data = await fetchWithAuth(`/api/Weight?date=${today}`)
      if (data && data.length > 0) {
        setTodaysWeight({ id: data[0].id, weight: data[0].weight })
      } else {
        setTodaysWeight(null)
      }
    } catch {
      setTodaysWeight(null)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadTodaysWeight()
  }, [loadTodaysWeight])

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
    if (action === 'weight') {
      setWeight(todaysWeight ? todaysWeight.weight.toString() : '')
      setShowWeightModal(true)
    } else {
      navigate(`/${action}?quick=true`)
    }
  }

  async function handleWeightSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSavingWeight(true)

    try {
      if (todaysWeight) {
        await fetchWithAuth(`/api/Weight/${todaysWeight.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            date: new Date().toISOString(),
            weight: parseFloat(weight),
          }),
        })
      } else {
        await fetchWithAuth('/api/Weight', {
          method: 'POST',
          body: JSON.stringify({
            date: new Date().toISOString(),
            weight: parseFloat(weight),
          }),
        })
      }
      setWeight('')
      setShowWeightModal(false)
      await loadTodaysWeight()
    } catch (error) {
      console.error('Failed to log weight:', error)
    } finally {
      setSavingWeight(false)
    }
  }

  return (
    <div className="min-h-screen text-white pb-24 md:pb-0">
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-shadow">Kaizen</span>
          <NavLink to="/" className={desktopLinkClass}>Dashboard</NavLink>
          <NavLink to="/workouts" className={desktopLinkClass}>Workouts</NavLink>
          <NavLink to="/progress" className={desktopLinkClass}>Progress</NavLink>
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
                <div className="text-left">
                  <span className="font-medium text-slate-900">Log Weight</span>
                  {todaysWeight && (
                    <p className="text-xs text-slate-400">Today: {todaysWeight.weight} kg</p>
                  )}
                </div>
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

      {/* Weight Modal */}
      <AnimatePresence>
        {showWeightModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowWeightModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-xl z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {todaysWeight ? 'Update Weight' : 'Log Weight'}
                  </h2>
                  {todaysWeight && (
                    <p className="text-sm text-slate-400">Current: {todaysWeight.weight} kg</p>
                  )}
                </div>
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"
                >
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleWeightSubmit}>
                <div className="mb-6">
                  <label className="block text-sm text-slate-500 mb-2">
                    {todaysWeight ? 'New weight (kg)' : "Today's weight (kg)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 75.5"
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900 text-2xl font-bold text-center"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingWeight}
                  className="w-full py-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                >
                  {savingWeight ? 'Saving...' : todaysWeight ? 'Update' : 'Save'}
                </button>
              </form>
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

        <NavLink to="/progress" className={linkClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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