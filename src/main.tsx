import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import { ClerkProvider } from '@clerk/clerk-react'
import { SearchProvider } from './context/SearchContext'
import { ErrorFallback } from './components/ErrorFallback'
import './index.css'
import App from './App'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '') as string

if (!clerkPublishableKey) {
  console.error('[ToolTrack] VITE_CLERK_PUBLISHABLE_KEY is not set. Auth will fail.')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <ClerkProvider publishableKey={clerkPublishableKey ?? ''} afterSignOutUrl="/login">
          <SearchProvider>
            <Toaster position="bottom-right" richColors />
            <App />
          </SearchProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
