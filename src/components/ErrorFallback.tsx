export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] px-4 text-center">
      <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Algo salió mal</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-6 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
      >
        Recargar
      </button>
    </div>
  )
}
