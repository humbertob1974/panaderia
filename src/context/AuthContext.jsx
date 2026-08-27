import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, getDocs, collection, limit, query, serverTimestamp } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const ref = doc(db, 'users', firebaseUser.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            setProfile({ id: snap.id, ...snap.data() })
          } else {
            // Primer inicio de sesión de una cuenta creada en la consola de
            // Firebase: si aún no hay usuarios registrados, se vuelve admin.
            const anyUser = await getDocs(query(collection(db, 'users'), limit(1)))
            const role = anyUser.empty ? 'admin' : 'staff'
            const data = {
              email: firebaseUser.email,
              role,
              createdAt: serverTimestamp(),
            }
            await setDoc(ref, data)
            setProfile({ id: firebaseUser.uid, ...data })
          }
        } catch (err) {
          console.error('Error cargando perfil:', err)
          setProfile({ id: firebaseUser.uid, email: firebaseUser.email, role: 'staff' })
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, isAdmin: profile?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
