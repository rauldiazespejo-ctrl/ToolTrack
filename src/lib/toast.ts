export type ToastLevel = 'success' | 'error' | 'info' | 'warning'

export type ToastItem = {
  id: string
  message: string
  level: ToastLevel
}

type ToastOptions = {
  message: string
  level: ToastLevel
}

const TOAST_EVENT = 'tooltrack-toast'

function dispatchToast(options: ToastOptions) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<ToastOptions>(TOAST_EVENT, { detail: options }))
}

export const toast = {
  success(message: string) {
    dispatchToast({ message, level: 'success' })
    return message
  },
  error(message: string) {
    dispatchToast({ message, level: 'error' })
    return message
  },
  info(message: string) {
    dispatchToast({ message, level: 'info' })
    return message
  },
  warning(message: string) {
    dispatchToast({ message, level: 'warning' })
    return message
  },
}

export { TOAST_EVENT }
