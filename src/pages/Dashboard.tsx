import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApi } from '../hooks/useApi'
import Grainient from '../components/Grainient'

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

interface TodayStats {
  calories: number
  protein: number
  carbs: number
  fat: number
  workouts: number
}

export default function Dashboard() {
  const { user } = useAuth0()
  const { fetchWithAuth } = useApi()
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [todayStats, setTodayStats] = useState<TodayStats>({ calories: 0, protein: 0, carbs: 0, fat: 0, workouts: 0 })
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const [summaryData, foodToday, workoutsToday] = await Promise.all([
        fetchWithAuth('/api/WeeklySummary'),
        fetchWithAuth(`/api/Food/logs?date=${today}`).catch(() => []),
        fetchWithAuth(`/api/Workout/logs?date=${today}`).catch(() => []),
      ])
      
      setSummary(summaryData)
      
      const foodTotals = (foodToday || []).reduce((acc: TodayStats, log: { calories: number; protein: number; carbs: number; fat: number }) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0),
        workouts: acc.workouts
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, workouts: 0 })
      
      setTodayStats({
        ...foodTotals,
        workouts: (workoutsToday || []).length
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadData()
  }, [loadData])

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative -m-4">
      {/* Animated Background */}
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

      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="mb-6 pt-4">
          <p className="text-white/70 text-sm text-shadow-sm">{dayName}</p>
          <h1 className="text-4xl font-black tracking-tight text-white text-shadow">DIARY</h1>
          <p className="text-cyan-300 text-shadow-sm">Today • {dateStr}</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Calories */}
          <div className="bg-white rounded-3xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <span className="text-slate-500 text-sm">Calories</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{todayStats.calories.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">of 2,000 kcal</p>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"
                style={{ width: `${Math.min((todayStats.calories / 2000) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-white rounded-3xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-slate-500 text-sm">Protein</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{todayStats.protein}</p>
            <p className="text-slate-400 text-sm">of 150 g</p>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                style={{ width: `${Math.min((todayStats.protein / 150) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Workouts */}
          <div className="bg-white rounded-3xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-slate-500 text-sm">Activity</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{todayStats.workouts}</p>
            <p className="text-slate-400 text-sm">workouts today</p>
          </div>

          {/* Weight */}
          <div className="bg-white rounded-3xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <span className="text-slate-500 text-sm">Weight</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{summary?.endWeight ?? '—'}</p>
            <p className="text-slate-400 text-sm">kg</p>
          </div>
        </div>

        {/* Macros Card */}
        <div className="bg-white rounded-3xl p-5 shadow-lg mb-4">
          <p className="text-slate-500 text-sm mb-4">Today's Macros</p>
          <div className="flex gap-6">
            <div className="flex-1 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-cyan-100 flex items-center justify-center">
                <span className="text-cyan-600 font-bold text-sm">{todayStats.carbs}g</span>
              </div>
              <p className="text-slate-400 text-xs">Carbs</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-sm">{todayStats.protein}g</span>
              </div>
              <p className="text-slate-400 text-xs">Protein</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">{todayStats.fat}g</span>
              </div>
              <p className="text-slate-400 text-xs">Fat</p>
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        {summary && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-white/70 text-sm">This Week</p>
              <span className="text-xs text-cyan-400 bg-cyan-400/20 px-2 py-1 rounded-full">
                {summary.daysTracked} days tracked
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-black text-white">{summary.workoutDays}</p>
                <p className="text-white/50 text-xs">Workout days</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{Math.round(summary.avgDailyCalories)}</p>
                <p className="text-white/50 text-xs">Avg calories</p>
              </div>
              <div>
                <p className={`text-3xl font-black ${
                  summary.weightChange === null ? 'text-white/50' :
                  summary.weightChange < 0 ? 'text-emerald-400' : 
                  summary.weightChange > 0 ? 'text-orange-400' : 'text-white/50'
                }`}>
                  {summary.weightChange !== null ? `${summary.weightChange > 0 ? '+' : ''}${summary.weightChange.toFixed(1)}` : '—'}
                </p>
                <p className="text-white/50 text-xs">kg change</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome message for new users */}
        {!summary && (
          <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Welcome, {user?.given_name || 'there'}!</h3>
            <p className="text-slate-500 text-sm">
              Start logging workouts, food and weight to see your stats here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}