import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SearchProvider } from './context/SearchContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from './components/Toaster'
import { ErrorFallback } from './components/ErrorFallback'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <SearchProvider>
          <Toaster />
          <App />
        </SearchProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
