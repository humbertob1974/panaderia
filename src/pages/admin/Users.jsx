import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db, getSecondaryAuth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/format'

const errorMessages = {
  'auth/email-already-in-use': 'Ese correo ya tiene una cuenta.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
}

export default function Users() {
  const { profile, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ email: '', password: '', role: 'staff' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Error cargando usuarios:', err)
    )
    return unsub
  }, [])

  if (!isAdmin) {
    return (
      <div className="card p-10 text-center text-stone-500">
        <p className="text-4xl">🔒</p>
        <p className="mt-3">Solo el administrador puede gestionar usuarios.</p>
      </div>
    )
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setCreating(true)
    try {
      // Se usa una instancia secundaria de Firebase para no cerrar la sesión
      // del administrador al crear la cuenta nueva.
      const secondaryAuth = getSecondaryAuth()
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email.trim(), form.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: form.email.trim(),
        role: form.role,
        createdAt: serverTimestamp(),
      })
      await signOut(secondaryAuth)
      setInfo(`✓ Cuenta creada para ${form.email.trim()}`)
      setForm({ email: '', password: '', role: 'staff' })
    } catch (err) {
      setError(errorMessages[err.code] ?? 'No se pudo crear la cuenta.')
    }
    setCreating(false)
  }

  const setRole = (u, role) => updateDoc(doc(db, 'users', u.id), { role })

  const handleRemove = (u) => {
    if (
      confirm(
        `¿Quitar el acceso de ${u.email}? (Su cuenta seguirá existiendo en Firebase Authentication; puedes eliminarla por completo desde la consola de Firebase.)`
      )
    ) {
      deleteDoc(doc(db, 'users', u.id))
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-serif text-2xl font-bold text-amber-900">Usuarios</h1>

      <form onSubmit={handleCreate} className="card space-y-4 p-4">
        <h2 className="font-bold text-stone-700">Dar de alta un usuario</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-600">Correo electrónico *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="field"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-600">Contraseña temporal *</label>
            <input
              type="text"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="field"
              autoComplete="off"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-600">Rol</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="field !w-auto">
              <option value="staff">Colaborador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? 'Creando…' : 'Crear cuenta'}
          </button>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}
        {info && <p className="rounded-lg bg-green-50 p-2.5 text-sm text-green-700">{info}</p>}
        <p className="text-xs text-stone-500">
          Comparte el correo y la contraseña temporal con la persona; podrá cambiarla con «¿Olvidaste tu
          contraseña?» en la pantalla de acceso.
        </p>
      </form>

      <h2 className="mb-2 mt-6 font-bold text-stone-700">Cuentas con acceso</h2>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="card flex flex-wrap items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">
                {u.email} {u.id === profile?.id && <span className="text-sm font-normal text-stone-400">(tú)</span>}
              </p>
              <p className="text-xs text-stone-500">Alta: {formatDate(u.createdAt) || '—'}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => setRole(u, e.target.value)}
              disabled={u.id === profile?.id}
              className="field !w-auto !py-1.5 text-sm"
            >
              <option value="staff">Colaborador</option>
              <option value="admin">Administrador</option>
            </select>
            {u.id !== profile?.id && (
              <button onClick={() => handleRemove(u)} className="text-sm text-red-600 hover:underline">
                Quitar acceso
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
