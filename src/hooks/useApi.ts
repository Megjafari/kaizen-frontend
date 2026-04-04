import { useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export function useApi() {
  const { getAccessTokenSilently } = useAuth0()

  const apiUrl = import.meta.env.VITE_API_URL

  const fetchWithAuth = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const token = await getAccessTokenSilently()

      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    },
    [getAccessTokenSilently, apiUrl]
  )

  return { fetchWithAuth }
}