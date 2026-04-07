import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApi } from '../hooks/useApi'
import { useProfile as useProfileContext } from '../hooks/useProfile'
import Onboarding from '../components/Onboarding'
import Grainient from '../components/Grainient'

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
  const { refreshProfile } = useProfileContext()
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
      await refreshProfile()
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  const goalText = goal === 'lose' ? 'Lose weight' : goal === 'gain' ? 'Gain weight' : 'Maintain weight'

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
        <div className="mb-8 pt-4">
          <h1 className="text-4xl font-black tracking-tight text-white">PROFILE</h1>
          <p className="text-slate-400">Manage your account</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-cyan-100 hover:border-cyan-300 transition-colors shadow-lg"
            >
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <p className="text-sm text-slate-500 mt-2">Tap to change photo</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{height}</p>
              <p className="text-xs text-slate-400">cm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{weight}</p>
              <p className="text-xs text-slate-400">kg</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{age}</p>
              <p className="text-xs text-slate-400">years</p>
            </div>
          </div>

          {/* Goal Badge */}
          <div className="flex justify-center mb-4">
            <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
              🎯 {goalText}
            </span>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
                required
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-900"
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
              className="w-full py-4 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white/10 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-white/60 mb-4">
            This will permanently delete your account and all your data.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
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
                  className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}