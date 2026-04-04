import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'

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
    return <p>Loading...</p>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Food</h1>

      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-zinc-900 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold">{Math.round(summary.totalCalories)}</p>
            <p className="text-sm text-zinc-400">Calories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{Math.round(summary.totalProtein)}g</p>
            <p className="text-sm text-zinc-400">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{Math.round(summary.totalCarbs)}g</p>
            <p className="text-sm text-zinc-400">Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{Math.round(summary.totalFat)}g</p>
            <p className="text-sm text-zinc-400">Fat</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-zinc-900 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">Search Ingredient</label>
          <input
            type="text"
            value={search}
            onChange={(e) => searchIngredients(e.target.value)}
            placeholder="e.g. chicken, rice, banana..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
          />

          {ingredients.length > 0 && (
            <div className="mt-2 border border-zinc-700 rounded max-h-40 overflow-y-auto">
              {ingredients.map((ing) => (
                <button
                  key={ing.id}
                  type="button"
                  onClick={() => {
                    setSelectedIngredient(ing)
                    setSearch(ing.name)
                    setIngredients([])
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800"
                >
                  <span>{ing.name}</span>
                  <span className="text-zinc-400 text-sm ml-2">
                    {ing.calories} kcal / 100g
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedIngredient && (
          <div className="mb-4 p-3 bg-zinc-800 rounded">
            <p className="font-medium">{selectedIngredient.name}</p>
            <p className="text-sm text-zinc-400">
              Per 100g: {selectedIngredient.calories} kcal | 
              P: {selectedIngredient.protein}g | 
              C: {selectedIngredient.carbs}g | 
              F: {selectedIngredient.fat}g
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">Amount (grams)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!selectedIngredient || !amount}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Log Food
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-3">Today's Log</h2>
      {logs.length === 0 ? (
        <p className="text-zinc-400">No food logged today.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between items-center p-3 bg-zinc-900 rounded">
              <div>
                <span className="font-medium">{log.ingredient.name}</span>
                <span className="text-zinc-400 text-sm ml-2">{log.amountGrams}g</span>
                <span className="text-zinc-500 text-sm ml-2">
                  ({Math.round(log.ingredient.calories * log.amountGrams / 100)} kcal)
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