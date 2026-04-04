import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'

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
    return <p>Loading...</p>
  }

  const latestWeight = logs[0]?.weight
  const oldestWeight = logs[logs.length - 1]?.weight
  const weightChange = logs.length >= 2 ? latestWeight - oldestWeight : null

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Weight</h1>

      {logs.length > 0 && (
        <div className="mb-6 p-4 bg-zinc-900 rounded-lg">
          <div className="text-center">
            <p className="text-4xl font-bold">{latestWeight} kg</p>
            <p className="text-sm text-zinc-400">Current weight</p>
            {weightChange !== null && (
              <p className={`text-sm mt-2 ${weightChange < 0 ? 'text-green-400' : weightChange > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg since first log
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-zinc-900 rounded-lg">
        <label className="block text-sm text-zinc-400 mb-1">Log today's weight</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 75.5"
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Log
          </button>
        </div>
      </form>

      <h2 className="text-lg font-semibold mb-3">History</h2>
      {logs.length === 0 ? (
        <p className="text-zinc-400">No weight logged yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between items-center p-3 bg-zinc-900 rounded">
              <div>
                <span className="font-medium">{log.weight} kg</span>
                <span className="text-zinc-400 text-sm ml-2">
                  {new Date(log.date).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => deleteLog(log.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}