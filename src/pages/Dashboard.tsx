import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApi } from '../hooks/useApi'

interface WeeklySummary {
  weekOf: string
  workoutDays: number
  totalWorkouts: number
  avgDailyCalories: number
  daysTracked: number
  startWeight: number | null
  endWeight: number | null
  weightChange: number | null
}

interface UserProfile {
  goal: string
}

export default function Dashboard() {
  const { user } = useAuth0()
  const { fetchWithAuth } = useApi()
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [summaryData, profileData] = await Promise.all([
        fetchWithAuth('/api/WeeklySummary'),
        fetchWithAuth('/api/Profile').catch(() => null),
      ])
      setSummary(summaryData)
      setProfile(profileData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return <p>Loading...</p>
  }

  const goalText = profile?.goal === 'lose' ? 'Lose weight' : profile?.goal === 'gain' ? 'Gain weight' : 'Maintain weight'

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.given_name || user?.name}!</h1>
      <p className="text-zinc-400 mb-6">
        {profile ? `Goal: ${goalText}` : 'Set up your profile to get started'}
      </p>

      {summary && (
        <>
          <h2 className="text-lg font-semibold mb-3">This Week</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-zinc-900 rounded-lg">
              <p className="text-3xl font-bold">{summary.workoutDays}</p>
              <p className="text-sm text-zinc-400">Workout days</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-lg">
              <p className="text-3xl font-bold">{summary.totalWorkouts}</p>
              <p className="text-sm text-zinc-400">Total workouts</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-lg">
              <p className="text-3xl font-bold">{Math.round(summary.avgDailyCalories)}</p>
              <p className="text-sm text-zinc-400">Avg daily calories</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-lg">
              <p className="text-3xl font-bold">{summary.daysTracked}</p>
              <p className="text-sm text-zinc-400">Days tracked</p>
            </div>
          </div>

          {(summary.startWeight || summary.endWeight) && (
            <div className="p-4 bg-zinc-900 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Weight Progress</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-zinc-400 text-sm">Start</p>
                  <p className="text-xl font-bold">{summary.startWeight ?? '-'} kg</p>
                </div>
                <div className="text-center">
                  {summary.weightChange !== null && (
                    <p className={`text-lg font-bold ${summary.weightChange < 0 ? 'text-green-400' : summary.weightChange > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                      {summary.weightChange > 0 ? '+' : ''}{summary.weightChange.toFixed(1)} kg
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm">Current</p>
                  <p className="text-xl font-bold">{summary.endWeight ?? '-'} kg</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!summary && (
        <p className="text-zinc-400">Start logging workouts, food and weight to see your weekly summary!</p>
      )}
    </div>
  )
}