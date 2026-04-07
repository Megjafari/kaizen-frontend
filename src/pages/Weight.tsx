import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import Grainient from '../components/Grainient'

interface WeightLog {
  id: number
  date: string
  weight: number
}

export default function Weight() {
  const { fetchWithAuth } = useApi()
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [weight, setWeight] = useState('')

  const loadData = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/Weight')
      setLogs(data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      date: new Date().toISOString(),
      weight: parseFloat(weight),
    }

    try {
      await fetchWithAuth('/api/Weight', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setWeight('')
      await loadData()
    } catch (error) {
      console.error('Failed to log weight:', error)
    }
  }

  async function deleteLog(id: number) {
    try {
      await fetchWithAuth(`/api/Weight/${id}`, { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const latestWeight = logs[0]?.weight
  const oldestWeight = logs[logs.length - 1]?.weight
  const weightChange = logs.length >= 2 ? latestWeight - oldestWeight : null

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
          <h1 className="text-4xl font-black tracking-tight text-white text-shadow">WEIGHT</h1>
          <p className="text-slate-400 text-shadow-sm">Track your progress</p>
        </div>

        {/* Current Weight Card */}
        {logs.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <p className="text-5xl font-black text-slate-900">{latestWeight}</p>
            <p className="text-slate-400 text-sm">kg</p>
            {weightChange !== null && (
              <div className={`mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                weightChange < 0 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : weightChange > 0 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {weightChange < 0 ? '↓' : weightChange > 0 ? '↑' : '→'}
                {Math.abs(weightChange).toFixed(1)} kg since start
              </div>
            )}
          </div>
        )}

        {/* Log Weight Form */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Log Weight</h2>
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 75.5"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900 text-lg font-medium"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
            >
              Log
            </button>
          </form>
        </div>

        {/* History */}
        <div>
          <h2 className="text-white/70 text-sm mb-3">History</h2>
          {logs.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <p className="text-white/50">No weight logged yet</p>
              <p className="text-white/30 text-sm">Log your weight to start tracking</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => {
                const prevWeight = logs[index + 1]?.weight
                const diff = prevWeight ? log.weight - prevWeight : null
                
                return (
                  <div key={log.id} className="bg-white rounded-2xl p-4 shadow-lg flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-slate-900">{log.weight}</span>
                        <span className="text-slate-400 text-sm ml-1">kg</span>
                      </div>
                      {diff !== null && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          diff < 0 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : diff > 0 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <button
                        onClick={() => deleteLog(log.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}