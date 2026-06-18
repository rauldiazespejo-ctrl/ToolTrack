import { useEffect, useState, type ReactElement } from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { TOAST_EVENT, type ToastItem, type ToastLevel } from '../lib/toast'

const iconByLevel: Record<ToastLevel, ReactElement> = {
  success: <CheckCircle2 size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
  warning: <TriangleAlert size={16} />,
}

const styleByLevel: Record<ToastLevel, string> = {
  success: 'border-green-500/20 bg-green-500/10 text-green-100',
  error: 'border-red-500/20 bg-red-500/10 text-red-100',
  info: 'border-blue-500/20 bg-blue-500/10 text-blue-100',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const onToast: EventListener = event => {
      const customEvent = event as CustomEvent<{ message: string; level: ToastLevel }>
      const id = crypto.randomUUID()
      setToasts(prev => [...prev, { id, message: customEvent.detail.message, level: customEvent.detail.level }])
      window.setTimeout(() => {
        setToasts(prev => prev.filter(item => item.id !== id))
      }, 3500)
    }

    window.addEventListener(TOAST_EVENT, onToast)
    return () => window.removeEventListener(TOAST_EVENT, onToast)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {toasts.map(toast => (
        <div key={toast.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${styleByLevel[toast.level]}`}>
          <div className="mt-0.5">{iconByLevel[toast.level]}</div>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToasts(prev => prev.filter(item => item.id !== toast.id))}
            className="rounded p-1 opacity-70 transition hover:opacity-100"
            aria-label="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
