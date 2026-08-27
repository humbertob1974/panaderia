import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'panaderia-cart'

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // almacenamiento no disponible (modo privado); el carrito vive en memoria
    }
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image ?? null, qty }]
    })
  }

  const updateQty = (id, qty) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    )
  }

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clearCart = () => setItems([])

  const { count, total } = useMemo(
    () => ({
      count: items.reduce((sum, i) => sum + i.qty, 0),
      total: items.reduce((sum, i) => sum + i.qty * i.price, 0),
    }),
    [items]
  )

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
