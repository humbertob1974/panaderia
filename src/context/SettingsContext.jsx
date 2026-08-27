import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

const SettingsContext = createContext(null)

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const defaultSettings = {
  name: 'Mi Panadería',
  slogan: 'Pan artesanal hecho en casa',
  logo: null,
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  website: '',
  instagram: '',
  facebook: '',
  deliveryFee: 0,
  deliveryNote: 'Entregamos a domicilio en la zona.',
  hours: DAYS.map(() => ({ open: true, from: '08:00', to: '18:00' })),
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [loaded, setLoaded] = useState(!isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsub = onSnapshot(
      doc(db, 'settings', 'business'),
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...defaultSettings, ...snap.data() })
        }
        setLoaded(true)
      },
      (err) => {
        console.error('Error cargando configuración:', err)
        setLoaded(true)
      }
    )
    return unsub
  }, [])

  useEffect(() => {
    document.title = settings.name || 'Panadería'
  }, [settings.name])

  return (
    <SettingsContext.Provider value={{ settings, loaded }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
