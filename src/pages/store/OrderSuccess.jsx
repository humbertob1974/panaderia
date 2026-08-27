import { Link, useLocation, useParams } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { formatPrice } from '../../lib/format'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const { state } = useLocation()
  const { settings } = useSettings()
  const order = state?.order

  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="text-6xl">🎉</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-amber-900">¡Pedido recibido!</h1>
      <p className="mt-2 text-stone-600">
        Gracias por tu compra{order?.customer?.name ? `, ${order.customer.name}` : ''}. Te contactaremos
        pronto para confirmar la entrega.
      </p>
      {order?.customer?.email && (
        <p className="mt-2 text-sm text-stone-500">
          Enviamos la confirmación a <strong>{order.customer.email}</strong>.
        </p>
      )}
      <p className="mt-3 rounded-xl bg-amber-100 px-4 py-2 text-sm text-amber-900">
        Número de pedido: <strong>{orderId.slice(0, 8).toUpperCase()}</strong>
      </p>

      {order && (
        <div className="mt-5 rounded-xl border border-stone-200 p-4 text-left text-sm">
          <ul className="space-y-1">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>
                  {i.qty}× {i.name}
                </span>
                <span className="font-semibold">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between border-t border-stone-200 pt-2 font-extrabold text-amber-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </p>
        </div>
      )}

      {settings.whatsapp && (
        <a
          href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, acabo de hacer el pedido ${orderId.slice(0, 8).toUpperCase()}`)}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary mt-5 w-full"
        >
          💬 Confirmar por WhatsApp
        </a>
      )}
      <Link to="/" className="btn-primary mt-3 w-full">
        Volver a la tienda
      </Link>
    </div>
  )
}
