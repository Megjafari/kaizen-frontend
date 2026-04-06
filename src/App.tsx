import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useState, useEffect, useCallback } from 'react'
import Layout from './components/Layout'
import Onboarding from './components/Onboarding'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Food from './pages/Food'
import Weight from './pages/Weight'
import Profile from './pages/Profile'
import { useApi } from './hooks/useApi'

function AppContent() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const { fetchWithAuth } = useApi()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)

  const checkProfile = useCallback(async () => {
    try {
      await fetchWithAuth('/api/Profile')
      setHasProfile(true)
    } catch {
      setHasProfile(false)
    } finally {
      setCheckingProfile(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    if (isAuthenticated) {
      checkProfile()
    }
  }, [isAuthenticated, checkProfile])

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
    setHasProfile(true)
  }

  if (isLoading || (isAuthenticated && checkingProfile)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
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

  if (!hasProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/food" element={<Food />} />
          <Route path="/weight" element={<Weight />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return <AppContent />
}

export default App