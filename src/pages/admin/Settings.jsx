import { useEffect, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useSettings, DAYS, defaultSettings } from '../../context/SettingsContext'
import { compressImage } from '../../lib/imageUtils'

export default function Settings() {
  const { settings, loaded } = useSettings()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (loaded) setForm({ ...defaultSettings, ...settings })
    // Solo sincroniza cuando termina la carga inicial, para no pisar la edición en curso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const setHour = (index, key, value) => {
    setForm((f) => ({
      ...f,
      hours: f.hours.map((h, i) => (i === index ? { ...h, [key]: value } : h)),
    }))
  }

  const handleLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const logo = await compressImage(file, { maxSize: 300 })
      set('logo', logo)
    } catch (err) {
      setMessage(err.message || 'No se pudo procesar el logo.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await setDoc(doc(db, 'settings', 'business'), {
        ...form,
        deliveryFee: Number(form.deliveryFee) || 0,
      })
      setMessage('✓ Configuración guardada')
      setTimeout(() => setMessage(''), 2500)
    } catch (err) {
      console.error('Error guardando configuración:', err)
      setMessage('No se pudo guardar. Intenta de nuevo.')
    }
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-serif text-2xl font-bold text-amber-900">Datos del negocio</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="card space-y-4 p-4">
          <h2 className="font-bold text-stone-700">Identidad</h2>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-amber-100 ring-2 ring-amber-800/20">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">🥖</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="btn-secondary w-full cursor-pointer text-sm">
                📷 {form.logo ? 'Cambiar logo' : 'Subir logo'}
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
              {form.logo && (
                <button type="button" onClick={() => set('logo', null)} className="w-full text-center text-sm text-red-600 hover:underline">
                  Quitar logo
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-600">Nombre del negocio *</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-600">Eslogan</label>
            <input value={form.slogan} onChange={(e) => set('slogan', e.target.value)} className="field" />
          </div>
        </section>

        <section className="card space-y-4 p-4">
          <h2 className="font-bold text-stone-700">Contacto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-600">Teléfono</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-600">WhatsApp (con código de país, ej. 1…)</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className="field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-600">Correo</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-600">Página web</label>
              <input type="url" placeholder="https://…" value={form.website} onChange={(e) => set('website', e.target.value)} className="field" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-stone-600">Dirección</label>
            <textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} className="field" />
          </div>
        </section>

        <section className="card space-y-4 p-4">
          <h2 className="font-bold text-stone-700">Entrega a domicilio</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-600">Costo de envío (USD, 0 = gratis)</label>
              <input
                type="number"
                min="0"
                step="0.50"
                inputMode="decimal"
                value={form.deliveryFee}
                onChange={(e) => set('deliveryFee', e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-stone-600">Mensaje de entrega</label>
              <input value={form.deliveryNote} onChange={(e) => set('deliveryNote', e.target.value)} className="field" />
            </div>
          </div>
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="font-bold text-stone-700">Horarios</h2>
          {form.hours.map((h, i) => (
            <div key={DAYS[i]} className="flex flex-wrap items-center gap-2">
              <label className="flex w-28 items-center gap-2 text-sm font-bold text-stone-600">
                <input
                  type="checkbox"
                  checked={h.open}
                  onChange={(e) => setHour(i, 'open', e.target.checked)}
                  className="h-4 w-4 accent-amber-800"
                />
                {DAYS[i]}
              </label>
              {h.open ? (
                <>
                  <input type="time" value={h.from} onChange={(e) => setHour(i, 'from', e.target.value)} className="field !w-auto !py-1.5 text-sm" />
                  <span className="text-stone-400">a</span>
                  <input type="time" value={h.to} onChange={(e) => setHour(i, 'to', e.target.value)} className="field !w-auto !py-1.5 text-sm" />
                </>
              ) : (
                <span className="text-sm text-stone-400">Cerrado</span>
              )}
            </div>
          ))}
        </section>

        <div className="sticky bottom-20 flex items-center justify-end gap-3 sm:bottom-4">
          {message && (
            <span className={`rounded-lg px-3 py-2 text-sm font-bold ${message.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
              {message}
            </span>
          )}
          <button type="submit" disabled={saving} className="btn-primary shadow-lg">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
