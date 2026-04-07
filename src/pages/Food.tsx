import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import Grainient from '../components/Grainient'

interface Ingredient {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface FoodLog {
  id: number
  date: string
  ingredientId: number
  ingredient: Ingredient
  amountGrams: number
}

interface DailySummary {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  items: number
}

export default function Food() {
  const { fetchWithAuth } = useApi()
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [amount, setAmount] = useState('')

  const [showAddIngredient, setShowAddIngredient] = useState(false)
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  const today = new Date().toISOString().split('T')[0]

  const loadData = useCallback(async () => {
    try {
      const [logsData, summaryData] = await Promise.all([
        fetchWithAuth(`/api/Food/logs?date=${today}`),
        fetchWithAuth(`/api/Food/summary?date=${today}`),
      ])
      setLogs(logsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth, today])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function searchIngredients(query: string) {
    setSearch(query)
    if (query.length < 2) {
      setIngredients([])
      return
    }

    try {
      const data = await fetchWithAuth(`/api/Food/ingredients?q=${query}`)
      setIngredients(data)
    } catch (error) {
      console.error('Failed to search:', error)
    }
  }

  async function handleAddIngredient(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      name: newIngredient.name,
      calories: parseFloat(newIngredient.calories),
      protein: parseFloat(newIngredient.protein),
      carbs: parseFloat(newIngredient.carbs),
      fat: parseFloat(newIngredient.fat),
    }

    try {
      const created = await fetchWithAuth('/api/Food/ingredients', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSelectedIngredient(created)
      setSearch(created.name)
      setShowAddIngredient(false)
      setNewIngredient({ name: '', calories: '', protein: '', carbs: '', fat: '' })
      setIngredients([])
    } catch (error) {
      console.error('Failed to add ingredient:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedIngredient) return

    const payload = {
      date: new Date().toISOString(),
      ingredientId: selectedIngredient.id,
      amountGrams: parseFloat(amount),
    }

    try {
      await fetchWithAuth('/api/Food/logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSelectedIngredient(null)
      setAmount('')
      setSearch('')
      setIngredients([])
      await loadData()
    } catch (error) {
      console.error('Failed to log food:', error)
    }
  }

  async function deleteLog(id: number) {
    try {
      await fetchWithAuth(`/api/Food/logs/${id}`, { method: 'DELETE' })
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
          <h1 className="text-4xl font-black tracking-tight text-white">FOOD</h1>
          <p className="text-slate-400">Track your nutrition</p>
        </div>

        {/* Daily Summary */}
        {summary && (
          <div className="bg-white rounded-3xl p-5 shadow-lg mb-4">
            <p className="text-slate-500 text-sm mb-4">Today's Nutrition</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-cyan-100 flex items-center justify-center">
                  <span className="text-cyan-600 font-bold text-xs">{Math.round(summary.totalCalories)}</span>
                </div>
                <p className="text-slate-400 text-xs">kcal</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-xs">{Math.round(summary.totalProtein)}g</span>
                </div>
                <p className="text-slate-400 text-xs">Protein</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-xs">{Math.round(summary.totalCarbs)}g</span>
                </div>
                <p className="text-slate-400 text-xs">Carbs</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xs">{Math.round(summary.totalFat)}g</span>
                </div>
                <p className="text-slate-400 text-xs">Fat</p>
              </div>
            </div>
          </div>
        )}

        {/* Log Food Form */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Log Food</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-slate-500 mb-1">Search Ingredient</label>
              <input
                type="text"
                value={search}
                onChange={(e) => searchIngredients(e.target.value)}
                placeholder="e.g. chicken, rice, banana..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
              />

              {ingredients.length > 0 && (
                <div className="mt-2 border border-slate-200 rounded-xl max-h-40 overflow-y-auto bg-white shadow-lg">
                  {ingredients.map((ing) => (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => {
                        setSelectedIngredient(ing)
                        setSearch(ing.name)
                        setIngredients([])
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-slate-900">{ing.name}</span>
                      <span className="text-slate-400 text-sm ml-2">
                        {ing.calories} kcal / 100g
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {ingredients.length === 0 && search.length >= 2 && !selectedIngredient && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddIngredient(true)
                    setNewIngredient({ ...newIngredient, name: search })
                  }}
                  className="mt-2 text-sm text-cyan-500 font-medium hover:text-cyan-600"
                >
                  + Add "{search}" as new ingredient
                </button>
              )}

              {showAddIngredient && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-medium text-slate-900 mb-3">Add New Ingredient (per 100g)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-cyan-400"
                    />
                    <input
                      type="number"
                      placeholder="Calories"
                      value={newIngredient.calories}
                      onChange={(e) => setNewIngredient({ ...newIngredient, calories: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-cyan-400"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={newIngredient.protein}
                      onChange={(e) => setNewIngredient({ ...newIngredient, protein: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-cyan-400"
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={newIngredient.carbs}
                      onChange={(e) => setNewIngredient({ ...newIngredient, carbs: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-cyan-400"
                    />
                    <input
                      type="number"
                      placeholder="Fat (g)"
                      value={newIngredient.fat}
                      onChange={(e) => setNewIngredient({ ...newIngredient, fat: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddIngredient(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedIngredient && (
              <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                <p className="font-medium text-slate-900">{selectedIngredient.name}</p>
                <p className="text-sm text-slate-500">
                  Per 100g: {selectedIngredient.calories} kcal | 
                  P: {selectedIngredient.protein}g | 
                  C: {selectedIngredient.carbs}g | 
                  F: {selectedIngredient.fat}g
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-500 mb-1">Amount (grams)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!selectedIngredient || !amount}
              className="w-full py-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              Log Food
            </button>
          </form>
        </div>

        {/* Today's Log */}
        <div>
          <h2 className="text-white/70 text-sm mb-3">Today's Log</h2>
          {logs.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-white/50">No food logged today</p>
              <p className="text-white/30 text-sm">Search and add food to start tracking</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl p-4 shadow-lg flex justify-between items-center">
                  <div>
                    <span className="font-medium text-slate-900">{log.ingredient.name}</span>
                    <div className="flex gap-3 mt-1">
                      <span className="text-slate-400 text-sm">{log.amountGrams}g</span>
                      <span className="text-cyan-500 text-sm font-medium">
                        {Math.round(log.ingredient.calories * log.amountGrams / 100)} kcal
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}