import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export function Login() {
  const { isSupabaseConfigured, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  if (user) {
    return <Navigate to="/events" replace />
  }

  async function signIn() {
    if (!supabase) return
    setIsBusy(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsBusy(false)
    setMessage(error ? error.message : 'Sesión iniciada.')
  }

  async function signUp() {
    if (!supabase) return
    setIsBusy(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({ email, password })
    setIsBusy(false)
    setMessage(error ? error.message : 'Usuario creado. Revisa tu correo si Supabase requiere confirmación.')
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <LogIn size={28} />
        <div>
          <span className="eyebrow">Acceso ToolTrack</span>
          <h1>Sincronizar eventos QR con Supabase.</h1>
          <p>
            Inicia sesión para asociar confirmaciones y diferencias a un usuario.
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="scan-warning">
            Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. La app
            seguirá funcionando en modo local.
          </div>
        ) : (
          <>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@empresa.cl"
              />
            </label>
            <label>
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>
            <div className="login-actions">
              <button type="button" disabled={isBusy} onClick={() => void signIn()}>
                Entrar
              </button>
              <button type="button" disabled={isBusy} onClick={() => void signUp()}>
                Crear usuario
              </button>
            </div>
          </>
        )}

        {message ? <div className="scan-message">{message}</div> : null}
      </section>
    </div>
  )
}
