import { useAuth0 } from '@auth0/auth0-react'

function App() {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout } = useAuth0()

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