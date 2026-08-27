import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

const errorMessages = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
}

export default function Login() {
  const { user, loading } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate('/admin')
    } catch (err) {
      setError(errorMessages[err.code] ?? 'No se pudo iniciar sesión. Intenta de nuevo.')
      setSubmitting(false)
    }
  }

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Escribe tu correo para enviarte el enlace de recuperación.')
      return
    }
    setError('')
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setInfo('Te enviamos un correo para restablecer tu contraseña.')
    } catch {
      setError('No se pudo enviar el correo de recuperación.')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 p-4">
      <div className="card w-full max-w-sm p-6 sm:p-8">
        <div className="text-center">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="mx-auto h-16 w-16 rounded-full object-cover" />
          ) : (
            <p className="text-5xl">🥖</p>
          )}
          <h1 className="mt-3 font-serif text-xl font-bold text-amber-900">{settings.name}</h1>
          <p className="mt-1 text-sm text-stone-500">Acceso al panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold text-stone-600">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold text-stone-600">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}
          {info && <p className="rounded-lg bg-green-50 p-2.5 text-sm text-green-700">{info}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={handleReset} className="text-amber-800 hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
          <Link to="/" className="text-stone-500 hover:underline">
            ← Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
