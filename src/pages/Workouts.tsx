import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [allLogs, setAllLogs] = useState<WorkoutLog[]>([])
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('quick') === 'true')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<{ exerciseName: string; sets: number; reps: number; weight: number }[]>([])

  const loadData = useCallback(async () => {
    try {
      const [logsData, templatesData] = await Promise.all([
        fetchWithAuth('/api/Workout/logs'),
        fetchWithAuth('/api/Workout/templates'),
      ])
      setAllLogs(logsData)
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

  useEffect(() => {
    if (searchParams.get('quick') === 'true') {
      setShowForm(true)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    return { daysInMonth, startingDay, year, month }
  }

  const getWorkoutsForDate = (date: Date) => {
    return allLogs.filter(log => {
      const logDate = new Date(log.date)
      return logDate.toDateString() === date.toDateString()
    })
  }

  const hasWorkout = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return getWorkoutsForDate(date).length > 0
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

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
      if (selectedDate) {
        const remaining = getWorkoutsForDate(selectedDate).filter(l => l.id !== id)
        if (remaining.length === 0) setSelectedDate(null)
      }
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

  const selectedWorkouts = selectedDate ? getWorkoutsForDate(selectedDate) : []
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen -m-4">
      <div className="max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="mb-6 pt-4 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white text-shadow">WORKOUTS</h1>
            <p className="text-slate-400 text-shadow-sm">Your training calendar</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
          >
            + New
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-3xl p-5 shadow-lg mb-4">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-slate-900">{monthName}</h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-slate-400 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const worked = hasWorkout(day)
            const today = isToday(day)
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const isSelected = selectedDate?.toDateString() === date.toDateString()

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(worked ? date : null)}
                className={`aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-white ring-2 ring-cyan-300'
                    : worked
                      ? 'bg-emerald-500 text-white'
                      : today
                        ? 'bg-slate-200 text-slate-900 font-bold'
                        : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            )
          })}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{allLogs.length}</p>
              <p className="text-xs text-slate-400">Total workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-500">
                {allLogs.filter(l => {
                  const d = new Date(l.date)
                  return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
                }).length}
              </p>
              <p className="text-xs text-slate-400">This month</p>
            </div>
          </div>
        </div>

        {/* Selected Day Workouts */}
        <AnimatePresence>
          {selectedDate && selectedWorkouts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4"
            >
              <h3 className="text-white/70 text-sm mb-3">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              <div className="space-y-3">
                {selectedWorkouts.map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-slate-900">{log.name}</span>
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates */}
        {!showForm && !selectedDate && templates.length > 0 && (
          <div className="mb-4">
            <h3 className="text-white/70 text-sm mb-3">Quick Start</h3>
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
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setShowForm(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed inset-x-4 bottom-24 top-20 bg-white rounded-3xl p-6 shadow-xl z-50 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Log Workout</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"
                  >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

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
                    className="w-full py-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors mt-4"
                  >
                    Save Workout
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}