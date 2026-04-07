import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import Grainient from '../components/Grainient'

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
        <div className="mb-6 pt-4 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">WORKOUT</h1>
            <p className="text-slate-400">Log your training</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
          >
            {showForm ? 'Cancel' : '+ New'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Log Workout</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Workout Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                  placeholder="e.g. Push Day"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                  placeholder="How did it go?"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-slate-500">Exercises</label>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="text-sm text-cyan-500 font-medium hover:text-cyan-600"
                  >
                    + Add Exercise
                  </button>
                </div>

                <div className="space-y-3">
                  {exercises.map((ex, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2">
                        <input
                          type="text"
                          placeholder="Exercise name"
                          value={ex.exerciseName}
                          onChange={(e) => updateExercise(i, 'exerciseName', e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-cyan-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeExercise(i)}
                          className="ml-2 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-slate-400">Sets</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => updateExercise(i, 'sets', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-cyan-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">Reps</label>
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => updateExercise(i, 'reps', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-cyan-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400">kg</label>
                          <input
                            type="number"
                            value={ex.weight}
                            onChange={(e) => updateExercise(i, 'weight', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {exercises.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-4">
                    No exercises added yet
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
              >
                Save Workout
              </button>
            </form>
          </div>
        )}

        {/* Templates */}
        {!showForm && templates.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white/70 text-sm mb-3">Quick Start Templates</h2>
            <div className="grid gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="text-left bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900">{t.name}</span>
                      <span className="ml-2 text-xs px-2 py-1 bg-violet-100 text-violet-600 rounded-full">
                        {t.level}
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{t.description}</p>
                  <p className="text-xs text-slate-400 mt-2">{t.exercises.length} exercises</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Workouts */}
        <div>
          <h2 className="text-white/70 text-sm mb-3">Recent Workouts</h2>
          {logs.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-white/50">No workouts logged yet</p>
              <p className="text-white/30 text-sm">Start a workout to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-slate-900">{log.name}</span>
                      <p className="text-xs text-slate-400">
                        {new Date(log.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="text-red-400 hover:text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  {log.exercises.length > 0 && (
                    <div className="space-y-1">
                      {log.exercises.map((ex, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-600">{ex.exerciseName}</span>
                          <span className="text-slate-400">
                            {ex.sets}×{ex.reps} @ {ex.weight}kg
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}