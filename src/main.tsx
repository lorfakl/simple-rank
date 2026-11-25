import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ClerkProvider } from '@clerk/react'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <App className="justify-center" />
      </ClerkProvider>
    ) : <p>Clerk is not configured. Set VITE_CLERK_PUBLISHABLE_KEY.</p>}
  </StrictMode>
)
