import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import { SearchProvider } from './context/SearchContext'
import { ErrorFallback } from './components/ErrorFallback'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <SearchProvider>
          <Toaster position="bottom-right" richColors />
          <App />
        </SearchProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
