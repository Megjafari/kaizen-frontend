import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Onboarding from './components/Onboarding'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Food from './pages/Food'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import PageTransition from './components/PageTransition'
import Grainient from './components/Grainient'
import { useApi } from './hooks/useApi'
import { ProfileProvider } from './context/ProfileProvider'
import { useProfile } from './hooks/useProfile'
import Progress from './pages/Progress'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/workouts" element={<PageTransition><Workouts /></PageTransition>} />
          <Route path="/food" element={<PageTransition><Food /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/progress" element={<PageTransition><Progress /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const { fetchWithAuth } = useApi()
  const { profile, loading: profileLoading, refreshProfile } = useProfile()

  async function handleOnboardingComplete(data: {
    gender: string
    weight: number
    height: number
    age: number
    goal: string
  }) {
    await fetchWithAuth('/api/Profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    await refreshProfile()
  }

  if (isLoading || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Kaizen</h1>
        <p className="text-zinc-400">Track your fitness journey</p>
        <button
          onClick={() => loginWithRedirect()}
          className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Log in to continue
        </button>
      </div>
    )
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return <AnimatedRoutes />
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Background - alltid synlig */}
      <div className="fixed inset-0 -z-10">
        <Grainient
          color1="#0f172a"
          color2="#67e8f9"
          color3="#020617"
          timeSpeed={0.1}
          warpStrength={0.3}
          warpFrequency={2}
          warpSpeed={0.5}
          warpAmplitude={100}
          grainAmount={0.03}
          contrast={1.2}
          saturation={0.8}
          zoom={1.2}
        />
      </div>
      
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </BrowserRouter>
  )
}