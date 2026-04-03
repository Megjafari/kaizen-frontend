import { useAuth0 } from '@auth0/auth0-react'

export function useApi() {
  const { getAccessTokenSilently } = useAuth0()

  const apiUrl = import.meta.env.VITE_API_URL

  async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
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
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  return { fetchWithAuth }
}