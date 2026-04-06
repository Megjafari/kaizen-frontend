import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApi } from '../hooks/useApi'
import Onboarding from '../components/Onboarding'

interface UserProfile {
  id: number
  height: number
  weight: number
  age: number
  gender: string
  goal: string
  profileImageUrl?: string
}

export default function Profile() {
  const { logout } = useAuth0()
  const { fetchWithAuth } = useApi()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

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
      setShowOnboarding(true)
    } finally {
      setLoading(false)
    }
  }, [fetchWithAuth])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const result = await fetchWithAuth('/api/Profile/image', {
        method: 'POST',
        body: JSON.stringify({ base64Image: base64 }),
      })

      setProfile(prev => prev ? { ...prev, profileImageUrl: result.url } : null)
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleOnboardingComplete(data: {
    gender: string
    weight: number
    height: number
    age: number
    goal: string
  }) {
    setSaving(true)
    try {
      await fetchWithAuth('/api/Profile', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setShowOnboarding(false)
      await loadProfile()
    } catch (error) {
      console.error('Failed to create profile:', error)
    } finally {
      setSaving(false)
    }
  }

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
      await fetchWithAuth('/api/Profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      await loadProfile()
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await fetchWithAuth('/api/Profile', { method: 'DELETE' })
      logout({ logoutParams: { returnTo: window.location.origin } })
    } catch (error) {
      console.error('Failed to delete account:', error)
      setDeleting(false)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {/* Profile Image */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700 hover:border-indigo-500 transition-colors"
        >
          {profile?.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          {uploadingImage && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-sm">Uploading...</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <p className="text-sm text-zinc-500 mt-2">Tap to change photo</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
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
          {saving ? 'Saving...' : 'Update'}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="border border-red-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-zinc-400 mb-4">
          This will permanently delete your account and all your data.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-red-400 font-medium">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}