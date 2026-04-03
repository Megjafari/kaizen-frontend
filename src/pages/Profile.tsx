import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../hooks/useApi'

interface UserProfile {
  id: number
  height: number
  weight: number
  age: number
  gender: string
  goal: string
}

export default function Profile() {
  const { fetchWithAuth } = useApi()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [goal, setGoal] = useState('')

  const loadProfile = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/Profile')
      setProfile(data)
      setHeight(data.height.toString())
      setWeight(data.weight.toString())
      setAge(data.age.toString())
      setGender(data.gender)
      setGoal(data.goal)
    } catch {
      // No profile yet
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      height: parseFloat(height),
      weight: parseFloat(weight),
      age: parseInt(age),
      gender,
      goal,
    }

    try {
      if (profile) {
        await fetchWithAuth('/api/Profile', {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      } else {
        await fetchWithAuth('/api/Profile', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      await loadProfile()
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-indigo-500"
            required
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:outline-none focus:border-indigo-500"
            required
          >
            <option value="">Select...</option>
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain weight</option>
            <option value="gain">Gain weight</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : profile ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  )
}