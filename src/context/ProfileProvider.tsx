import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApi } from '../hooks/useApi'
import { ProfileContext } from './ProfileContext'
import type { Profile } from './ProfileContextType'

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth0()
  const { fetchWithAuth } = useApi()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const data = await fetchWithAuth('/api/Profile')
      setProfile(data)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, fetchWithAuth])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}