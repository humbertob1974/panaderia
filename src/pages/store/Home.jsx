import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { formatPrice } from '../../lib/format'

function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="aspect-square w-full bg-amber-100">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🍞</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="font-bold leading-tight text-stone-800">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-stone-500">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-extrabold text-amber-900">{formatPrice(product.price)}</span>
          <button onClick={handleAdd} className="btn-primary !px-3 !py-2 text-sm" aria-label={`Agregar ${product.name} al carrito`}>
            {added ? '✓ Agregado' : '+ Agregar'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    // Se filtra "active" en el cliente para no requerir un índice compuesto.
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.active))
        setLoading(false)
      },
      (err) => {
        console.error('Error cargando productos:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  return (
    <div>
      <section className="mb-6 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 px-5 py-8 text-center text-amber-50 sm:py-10">
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">{settings.name}</h1>
        {settings.slogan && <p className="mt-2 text-amber-200">{settings.slogan}</p>}
        {settings.deliveryNote && (
          <p className="mx-auto mt-3 inline-block rounded-full bg-amber-50/15 px-4 py-1.5 text-sm">
            🛵 {settings.deliveryNote}
          </p>
        )}
      </section>

      <h2 className="mb-4 font-serif text-xl font-bold text-amber-900">Nuestros productos</h2>

      {loading ? (
        <p className="animate-pulse py-10 text-center text-stone-500">Cargando productos…</p>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          <p className="text-4xl">🧑‍🍳</p>
          <p className="mt-3">Aún no hay productos publicados. ¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
