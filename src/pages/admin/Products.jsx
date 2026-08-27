import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { compressImage } from '../../lib/imageUtils'
import { formatPrice } from '../../lib/format'

const emptyForm = { name: '', description: '', price: '', image: null, active: true }

function ProductForm({ product, onClose }) {
  const [form, setForm] = useState(product ?? emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const image = await compressImage(file)
      setForm((f) => ({ ...f, image }))
    } catch (err) {
      setError(err.message || 'No se pudo procesar la imagen. Intenta con otra foto.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image: form.image ?? null,
        active: form.active,
      }
      if (product?.id) {
        await updateDoc(doc(db, 'products', product.id), data)
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
      }
      onClose()
    } catch (err) {
      console.error('Error guardando producto:', err)
      if (err.code === 'permission-denied') {
        setError('Tu cuenta no tiene permisos para guardar. Revisa que las reglas de Firestore estén publicadas.')
      } else if (String(err.message).includes('longer than')) {
        setError('La foto es demasiado pesada para guardarse. Sube una imagen más ligera.')
      } else {
        setError(`No se pudo guardar el producto. (${err.message})`)
      }
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-amber-900">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-amber-100">
              {form.image ? (
                <img src={form.image} alt="Vista previa" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">🍞</div>
              )}
            </div>
            <div className="flex-1">
              <label className="btn-secondary w-full cursor-pointer text-sm">
                📷 {form.image ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              {form.image && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image: null }))}
                  className="mt-2 w-full text-center text-sm text-red-600 hover:underline"
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="pname" className="mb-1 block text-sm font-bold text-stone-600">
              Nombre *
            </label>
            <input
              id="pname"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field"
              placeholder="Ej. Concha de vainilla"
            />
          </div>

          <div>
            <label htmlFor="pdesc" className="mb-1 block text-sm font-bold text-stone-600">
              Descripción
            </label>
            <textarea
              id="pdesc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field"
              placeholder="Ingredientes, tamaño, qué lo hace especial…"
            />
          </div>

          <div>
            <label htmlFor="pprice" className="mb-1 block text-sm font-bold text-stone-600">
              Precio (USD) *
            </label>
            <input
              id="pprice"
              type="number"
              required
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="field"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-stone-600">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-amber-800"
            />
            Visible en la tienda
          </label>

          {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | product
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Error cargando productos:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const toggleActive = (p) => updateDoc(doc(db, 'products', p.id), { active: !p.active })

  const handleDelete = (p) => {
    if (confirm(`¿Eliminar "${p.name}" del catálogo?`)) {
      deleteDoc(doc(db, 'products', p.id))
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold text-amber-900">Catálogo</h1>
        <button onClick={() => setEditing('new')} className="btn-primary text-sm">
          + Nuevo producto
        </button>
      </div>

      {loading ? (
        <p className="animate-pulse py-10 text-center text-stone-500">Cargando…</p>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          <p className="text-4xl">🥐</p>
          <p className="mt-3">Tu catálogo está vacío. Agrega tu primer producto.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className={`card flex items-center gap-3 p-3 ${!p.active ? 'opacity-60' : ''}`}>
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-amber-100">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🍞</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{p.name}</p>
                <p className="text-sm font-semibold text-amber-900">{formatPrice(p.price)}</p>
                {!p.active && <p className="text-xs text-stone-500">Oculto en la tienda</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => toggleActive(p)}
                  className="rounded-lg p-2 text-lg transition hover:bg-amber-100"
                  title={p.active ? 'Ocultar de la tienda' : 'Mostrar en la tienda'}
                >
                  {p.active ? '👁️' : '🚫'}
                </button>
                <button
                  onClick={() => setEditing(p)}
                  className="rounded-lg p-2 text-lg transition hover:bg-amber-100"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="rounded-lg p-2 text-lg transition hover:bg-red-50"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ProductForm product={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
