import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, LogIn } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  if (isAuthenticated) {
    navigate('/', { replace: true })
  }

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) {
      errors.email = 'El correo es obligatorio'
    } else if (!email.includes('@')) {
      errors.email = 'Ingrese un correo valido'
    }
    if (!password.trim()) {
      errors.password = 'La contrasena es obligatoria'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    setIsSubmitting(true)
    const { error: signInError } = await signIn(email.trim(), password)
    setIsSubmitting(false)
    if (signInError) {
      setError(signInError.message || 'Error al iniciar sesion')
      return
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent)]">
            <HardHat size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">SOLDESP ToolTrack</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Gestion de Activos Industriales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <Input
            label="Correo electronico"
            type="email"
            placeholder="usuario@soldesp.cl"
            value={email}
            onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })) }}
            error={fieldErrors.email}
          />
          <Input
            label="Contrasena"
            type="password"
            placeholder="Ingrese su contrasena"
            value={password}
            onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })) }}
            error={fieldErrors.password}
          />

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <Button type="submit" className="w-full" icon={<LogIn size={16} />} disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando...' : 'Iniciar Sesion'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          SOLDESP S.A. — Sistema interno de gestion
        </p>
      </div>
    </div>
  )
}
