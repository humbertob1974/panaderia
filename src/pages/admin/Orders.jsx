import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { formatPrice, formatDate } from '../../lib/format'

const STATUSES = [
  { value: 'nuevo', label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
  { value: 'preparando', label: 'Preparando', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'en_camino', label: 'En camino', color: 'bg-purple-100 text-purple-800' },
  { value: 'entregado', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
]

const statusInfo = (value) => STATUSES.find((s) => s.value === value) ?? STATUSES[0]

const PAYMENTS = [
  { value: 'pendiente', label: 'Pago pendiente', short: 'Pendiente', icon: '⏳', color: 'bg-orange-100 text-orange-800' },
  { value: 'efectivo', label: 'Efectivo', short: 'Efectivo', icon: '💵', color: 'bg-green-100 text-green-800' },
  { value: 'cheque', label: 'Cheque', short: 'Cheque', icon: '🏦', color: 'bg-green-100 text-green-800' },
  { value: 'electronico', label: 'Pago electrónico', short: 'Electrónico', icon: '📱', color: 'bg-green-100 text-green-800' },
]

const paymentInfo = (value) => PAYMENTS.find((p) => p.value === value) ?? PAYMENTS[0]

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const info = statusInfo(order.status)
  const payment = paymentInfo(order.paymentMethod)

  const setStatus = (status) => updateDoc(doc(db, 'orders', order.id), { status })
  const setPayment = (paymentMethod) => updateDoc(doc(db, 'orders', order.id), { paymentMethod })

  const handleDelete = () => {
    if (confirm('¿Eliminar este pedido definitivamente?')) {
      deleteDoc(doc(db, 'orders', order.id))
    }
  }

  return (
    <li className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {order.customer?.name || 'Cliente'}{' '}
            <span className="font-normal text-stone-400">· #{order.id.slice(0, 6).toUpperCase()}</span>
          </p>
          <p className="text-sm text-stone-500">
            {formatDate(order.createdAt)} · {order.items?.length ?? 0} producto(s)
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${info.color}`}>{info.label}</span>
        <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-bold sm:inline ${payment.color}`} title={payment.label}>
          {payment.icon} {payment.short}
        </span>
        <span className="shrink-0 font-extrabold text-amber-900">{formatPrice(order.total)}</span>
        <span className="text-stone-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-stone-100 p-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="font-bold text-stone-600">Contacto</p>
              <p>📞 <a href={`tel:${order.customer?.phone}`} className="text-amber-800 hover:underline">{order.customer?.phone}</a></p>
              {order.customer?.email && (
                <p className="mt-1">✉️ <a href={`mailto:${order.customer.email}`} className="text-amber-800 hover:underline">{order.customer.email}</a></p>
              )}
              <p className="mt-1">📍 {order.customer?.address}</p>
              {order.customer?.notes && <p className="mt-1 text-stone-500">📝 {order.customer.notes}</p>}
            </div>
            <div>
              <p className="font-bold text-stone-600">Productos</p>
              <ul className="mt-1 space-y-0.5">
                {order.items?.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-2">
                    <span>{i.qty}× {i.name}</span>
                    <span>{formatPrice(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 flex justify-between border-t border-stone-200 pt-1">
                <span>Envío</span>
                <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Gratis'}</span>
              </p>
              <p className="flex justify-between font-extrabold text-amber-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-100 pt-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-stone-600">Estado:</label>
              <select
                value={order.status}
                onChange={(e) => setStatus(e.target.value)}
                className="field !w-auto !py-1.5 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-stone-600">Pago:</label>
              <select
                value={order.paymentMethod ?? 'pendiente'}
                onChange={(e) => setPayment(e.target.value)}
                className="field !w-auto !py-1.5 text-sm"
              >
                {PAYMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleDelete} className="ml-auto text-sm text-red-600 hover:underline">
              Eliminar pedido
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('activos')

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Error cargando pedidos:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const filtered = orders.filter((o) => {
    if (filter === 'activos') return !['entregado', 'cancelado'].includes(o.status)
    if (filter === 'todos') return true
    return o.status === filter
  })

  const newCount = orders.filter((o) => o.status === 'nuevo').length

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold text-amber-900">
          Pedidos {newCount > 0 && <span className="ml-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-800">{newCount} nuevos</span>}
        </h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field !w-auto !py-2 text-sm">
          <option value="activos">Activos</option>
          <option value="todos">Todos</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="animate-pulse py-10 text-center text-stone-500">Cargando pedidos…</p>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          <p className="text-4xl">📭</p>
          <p className="mt-3">No hay pedidos {filter === 'activos' ? 'activos' : 'con este filtro'}.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      )}
    </div>
  )
}
