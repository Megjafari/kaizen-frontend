import { useAuth0 } from '@auth0/auth0-react'
import { useApi } from './hooks/useApi'

function App() {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout } = useAuth0()
  const { fetchWithAuth } = useApi()

  async function testApi() {
    try {
      const profile = await fetchWithAuth('/api/Profile')
      console.log('Profile:', profile)
    } catch (error) {
      console.log('No profile yet:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Kaizen</h1>

      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}</p>
          <button
            onClick={testApi}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Test API
          </button>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Log out
          </button>
        </>
      ) : (
        <button
          onClick={() => loginWithRedirect()}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Log in
        </button>
      )}
    </div>
  )
}

export default App