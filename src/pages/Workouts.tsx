import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'

interface Exercise {
  id: number
  exerciseName: string
  sets: number
  reps: number
  weight: number
}

interface WorkoutLog {
  id: number
  date: string
  name: string
  notes?: string
  exercises: Exercise[]
}

interface WorkoutTemplate {
  id: number
  name: string
  description: string
  level: string
  exercises: {
    exerciseName: string
    sets: number
    reps: number
    notes?: string
  }[]
}

export default function Workouts() {
  const { fetchWithAuth } = useApi()
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<{ exerciseName: string; sets: number; reps: number; weight: number }[]>([])

  const loadData = useCallback(async () => {
    try {
      const [logsData, templatesData] = await Promise.all([
        fetchWithAuth('/api/Workout/logs'),
        fetchWithAuth('/api/Workout/templates'),
      ])
      setLogs(logsData)
      setTemplates(templatesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadData()
  }, [loadData])

  function applyTemplate(template: WorkoutTemplate) {
    setName(template.name)
    setExercises(
      template.exercises.map((e) => ({
        exerciseName: e.exerciseName,
        sets: e.sets,
        reps: e.reps,
        weight: 0,
      }))
    )
    setShowForm(true)
  }

  function addExercise() {
    setExercises([...exercises, { exerciseName: '', sets: 3, reps: 10, weight: 0 }])
  }

  function updateExercise(index: number, field: string, value: string | number) {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      date: new Date().toISOString(),
      name,
      notes: notes || null,
      exercises: exercises.map((ex) => ({
        exerciseName: ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || 0,
      })),
    }

    console.log('Sending payload:', payload) // Debug

    try {
      await fetchWithAuth('/api/Workout/logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setShowForm(false)
      setName('')
      setNotes('')
      setExercises([])
      await loadData()
    } catch (error) {
      console.error('Failed to save workout:', error)
    }
  }

  async function deleteLog(id: number) {
    try {
      await fetchWithAuth(`/api/Workout/logs/${id}`, { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Failed to delete workout:', error)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'New Workout'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-zinc-900 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-1">Workout Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-zinc-400">Exercises</label>
              <button
                type="button"
                onClick={addExercise}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                + Add Exercise
              </button>
            </div>

            {exercises.map((ex, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Exercise"
                  value={ex.exerciseName}
                  onChange={(e) => updateExercise(i, 'exerciseName', e.target.value)}
                  className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={ex.sets}
                  onChange={(e) => updateExercise(i, 'sets', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={(e) => updateExercise(i, 'reps', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="kg"
                  value={ex.weight}
                  onChange={(e) => updateExercise(i, 'weight', parseFloat(e.target.value))}
                  className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeExercise(i)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Save Workout
          </button>
        </form>
      )}

      {!showForm && templates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Templates</h2>
          <div className="grid gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className="text-left p-3 bg-zinc-900 rounded hover:bg-zinc-800"
              >
                <span className="font-medium">{t.name}</span>
                <span className="text-zinc-400 text-sm ml-2">({t.level})</span>
                <p className="text-sm text-zinc-500">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Recent Workouts</h2>
      {logs.length === 0 ? (
        <p className="text-zinc-400">No workouts logged yet.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-4 bg-zinc-900 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <span className="font-medium">{log.name}</span>
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
              {log.exercises.length > 0 && (
                <ul className="mt-2 text-sm text-zinc-400">
                  {log.exercises.map((ex, i) => (
                    <li key={i}>
                      {ex.exerciseName}: {ex.sets}×{ex.reps} @ {ex.weight}kg
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}