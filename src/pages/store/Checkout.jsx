import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { formatPrice } from '../../lib/format'
import { sendOrderConfirmation } from '../../lib/email'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  const deliveryFee = Number(settings.deliveryFee) || 0
  const grandTotal = total + deliveryFee

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-4 text-stone-500">No tienes productos en el carrito.</p>
        <Link to="/" className="btn-primary mt-6">
          Ver productos
        </Link>
      </div>
    )
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const order = {
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          notes: form.notes.trim(),
        },
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        subtotal: total,
        deliveryFee,
        total: grandTotal,
        status: 'nuevo',
        createdAt: serverTimestamp(),
      }
      const ref = await addDoc(collection(db, 'orders'), order)
      // El correo de confirmación no debe bloquear ni tirar el pedido si falla.
      sendOrderConfirmation({ order, orderId: ref.id, settings }).catch((err) =>
        console.error('No se pudo enviar el correo de confirmación:', err)
      )
      clearCart()
      navigate(`/pedido/${ref.id}`, { state: { order: { ...order, id: ref.id } } })
    } catch (err) {
      console.error('Error creando pedido:', err)
      setError('No se pudo enviar el pedido. Revisa tu conexión e intenta de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-serif text-2xl font-bold text-amber-900">Datos de entrega</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_260px] sm:items-start">
        <div className="card space-y-4 p-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-bold text-stone-600">
              Nombre completo *
            </label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} className="field" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-bold text-stone-600">
              Teléfono *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handleChange}
              className="field"
              autoComplete="tel"
              placeholder="Para confirmar tu pedido"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold text-stone-600">
              Correo electrónico *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="field"
              autoComplete="email"
              inputMode="email"
              placeholder="Te enviaremos la confirmación del pedido"
            />
          </div>
          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-bold text-stone-600">
              Dirección de entrega *
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              value={form.address}
              onChange={handleChange}
              className="field"
              autoComplete="street-address"
              placeholder="Calle, número, colonia, referencias…"
            />
          </div>
          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-bold text-stone-600">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              className="field"
              placeholder="Ej. entregar después de las 5 pm"
            />
          </div>
        </div>

        <aside className="card p-4">
          <h2 className="mb-3 font-bold text-stone-700">Resumen</h2>
          <ul className="space-y-1.5 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="text-stone-600">
                  {i.qty}× {i.name}
                </span>
                <span className="shrink-0 font-semibold">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-stone-200 pt-3 text-sm">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </p>
            <p className="flex justify-between">
              <span>Envío</span>
              <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratis'}</span>
            </p>
            <p className="flex justify-between pt-1 text-base font-extrabold text-amber-900">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </p>
          </div>
          <p className="mt-3 text-xs text-stone-500">El pago se realiza al recibir tu pedido.</p>
          {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full">
            {submitting ? 'Enviando…' : 'Confirmar pedido'}
          </button>
        </aside>
      </form>
    </div>
  )
}
