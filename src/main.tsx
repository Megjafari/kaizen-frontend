import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Auth0ProviderWithNavigate from './auth/Auth0Provider'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0ProviderWithNavigate>
      <App />
    </Auth0ProviderWithNavigate>
  </StrictMode>,
)