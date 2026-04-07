import { Auth0Provider } from '@auth0/auth0-react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function Auth0ProviderWithNavigate({ children }: Props) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  )
}