import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../lib/format'

export default function Cart() {
  const { items, updateQty, removeItem, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-serif text-xl font-bold text-amber-900">Tu carrito está vacío</h1>
        <p className="mt-2 text-stone-500">Agrega algunos panes deliciosos para empezar.</p>
        <Link to="/" className="btn-primary mt-6">
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-serif text-2xl font-bold text-amber-900">Tu carrito</h1>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="card flex items-center gap-3 p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-amber-100">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">🍞</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{item.name}</p>
              <p className="text-sm text-stone-500">{formatPrice(item.price)} c/u</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQty(item.id, item.qty - 1)}
                className="h-8 w-8 rounded-lg bg-amber-100 font-bold text-amber-900 transition hover:bg-amber-200"
                aria-label="Quitar uno"
              >
                −
              </button>
              <span className="w-8 text-center font-bold">{item.qty}</span>
              <button
                onClick={() => updateQty(item.id, item.qty + 1)}
                className="h-8 w-8 rounded-lg bg-amber-100 font-bold text-amber-900 transition hover:bg-amber-200"
                aria-label="Agregar uno"
              >
                +
              </button>
            </div>
            <div className="hidden w-20 text-right font-bold sm:block">{formatPrice(item.price * item.qty)}</div>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1 text-stone-400 transition hover:text-red-600"
              aria-label={`Eliminar ${item.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="card mt-4 flex items-center justify-between p-4">
        <span className="text-lg font-bold">Total</span>
        <span className="text-xl font-extrabold text-amber-900">{formatPrice(total)}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link to="/" className="btn-secondary">
          Seguir comprando
        </Link>
        <button onClick={() => navigate('/checkout')} className="btn-primary">
          Hacer pedido →
        </button>
      </div>
    </div>
  )
}
