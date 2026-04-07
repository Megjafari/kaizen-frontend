import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'
import { Navigate } from 'react-router-dom'

interface User {
  id: number
  userId: string
  height: number
  weight: number
  age: number
  gender: string
  goal: string
  profileImageUrl?: string
  isAdmin: boolean
}

interface Ingredient {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface WorkoutTemplate {
  id: number
  name: string
  exercises: { id: number; name: string; sets: number; reps: number }[]
}

export default function Admin() {
  const { fetchWithAuth } = useApi()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState<'users' | 'ingredients' | 'templates'>('users')

  const [users, setUsers] = useState<User[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const [newIngredient, setNewIngredient] = useState({
    name: '', calories: 0, protein: 0, carbs: 0, fat: 0
  })

  const loadData = useCallback(async () => {
    try {
      const adminCheck = await fetchWithAuth('/api/Admin/check')
      setIsAdmin(adminCheck)

      if (adminCheck) {
        const [usersData, ingredientsData, templatesData] = await Promise.all([
          fetchWithAuth('/api/Admin/users'),
          fetchWithAuth('/api/Admin/ingredients'),
          fetchWithAuth('/api/Admin/templates')
        ])
        setUsers(usersData)
        setIngredients(ingredientsData)
        setTemplates(templatesData)
      }
    } catch {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function deleteUser(id: number) {
    if (!confirm('Delete this user?')) return
    await fetchWithAuth(`/api/Admin/users/${id}`, { method: 'DELETE' })
    setUsers(users.filter(u => u.id !== id))
  }

  async function deleteIngredient(id: number) {
    if (!confirm('Delete this ingredient?')) return
    await fetchWithAuth(`/api/Admin/ingredients/${id}`, { method: 'DELETE' })
    setIngredients(ingredients.filter(i => i.id !== id))
  }

  async function addIngredient(e: React.FormEvent) {
    e.preventDefault()
    const created = await fetchWithAuth('/api/Admin/ingredients', {
      method: 'POST',
      body: JSON.stringify(newIngredient)
    })
    setIngredients([...ingredients, created])
    setNewIngredient({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  async function deleteTemplate(id: number) {
    if (!confirm('Delete this template?')) return
    await fetchWithAuth(`/api/Admin/templates/${id}`, { method: 'DELETE' })
    setTemplates(templates.filter(t => t.id !== id))
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (isAdmin === false) {
    return <Navigate to="/" />
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded ${tab === 'users' ? 'bg-indigo-600' : 'bg-zinc-800'}`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab('ingredients')}
          className={`px-4 py-2 rounded ${tab === 'ingredients' ? 'bg-indigo-600' : 'bg-zinc-800'}`}
        >
          Ingredients ({ingredients.length})
        </button>
        <button
          onClick={() => setTab('templates')}
          className={`px-4 py-2 rounded ${tab === 'templates' ? 'bg-indigo-600' : 'bg-zinc-800'}`}
        >
          Templates ({templates.length})
        </button>
      </div>

      {tab === 'users' && (
        <div className="flex flex-col gap-3">
          {users.map(user => (
            <div key={user.id} className="bg-zinc-900 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-700" />
                )}
                <div>
                  <p className="font-medium">{user.gender}, {user.age} år</p>
                  <p className="text-sm text-zinc-400">{user.height}cm, {user.weight}kg - {user.goal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.isAdmin && <span className="text-xs bg-indigo-600 px-2 py-1 rounded">Admin</span>}
                <button
                  onClick={() => deleteUser(user.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'ingredients' && (
        <div>
          <form onSubmit={addIngredient} className="bg-zinc-900 p-4 rounded-lg mb-4 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Name"
              value={newIngredient.name}
              onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
              className="px-3 py-2 bg-zinc-800 rounded flex-1 min-w-40"
              required
            />
            <input
              type="number"
              placeholder="Calories"
              value={newIngredient.calories || ''}
              onChange={e => setNewIngredient({ ...newIngredient, calories: +e.target.value })}
              className="px-3 py-2 bg-zinc-800 rounded w-24"
              required
            />
            <input
              type="number"
              placeholder="Protein"
              value={newIngredient.protein || ''}
              onChange={e => setNewIngredient({ ...newIngredient, protein: +e.target.value })}
              className="px-3 py-2 bg-zinc-800 rounded w-24"
              required
            />
            <input
              type="number"
              placeholder="Carbs"
              value={newIngredient.carbs || ''}
              onChange={e => setNewIngredient({ ...newIngredient, carbs: +e.target.value })}
              className="px-3 py-2 bg-zinc-800 rounded w-24"
              required
            />
            <input
              type="number"
              placeholder="Fat"
              value={newIngredient.fat || ''}
              onChange={e => setNewIngredient({ ...newIngredient, fat: +e.target.value })}
              className="px-3 py-2 bg-zinc-800 rounded w-24"
              required
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700">
              Add
            </button>
          </form>

          <div className="flex flex-col gap-2">
            {ingredients.map(ing => (
              <div key={ing.id} className="bg-zinc-900 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{ing.name}</p>
                  <p className="text-sm text-zinc-400">
                    {ing.calories} kcal | P: {ing.protein}g | C: {ing.carbs}g | F: {ing.fat}g
                  </p>
                </div>
                <button
                  onClick={() => deleteIngredient(ing.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'templates' && (
        <div className="flex flex-col gap-3">
          {templates.map(template => (
            <div key={template.id} className="bg-zinc-900 p-4 rounded-lg flex justify-between items-start">
              <div>
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-zinc-400">
                  {template.exercises?.length || 0} exercises
                </p>
              </div>
              <button
                onClick={() => deleteTemplate(template.id)}
                className="text-red-400 hover:text-red-300"
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