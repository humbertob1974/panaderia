import { Link, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings, DAYS } from '../context/SettingsContext'

function CartIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H19M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  )
}

export default function StoreLayout() {
  const { count } = useCart()
  const { settings } = useSettings()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-amber-900/10 bg-amber-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-amber-800/20" />
            ) : (
              <span className="text-3xl">🥖</span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-bold text-amber-900 sm:text-xl">
                {settings.name}
              </span>
              {settings.slogan && (
                <span className="hidden truncate text-xs text-stone-500 sm:block">{settings.slogan}</span>
              )}
            </span>
          </Link>
          <Link
            to="/carrito"
            className="relative rounded-xl p-2 text-amber-900 transition hover:bg-amber-100"
            aria-label={`Carrito, ${count} artículos`}
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-800 px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="mt-8 border-t border-amber-900/10 bg-amber-100/60">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 text-sm text-stone-600 sm:grid-cols-3">
          <div>
            <p className="font-serif text-base font-bold text-amber-900">{settings.name}</p>
            {settings.slogan && <p className="mt-1">{settings.slogan}</p>}
            {settings.address && <p className="mt-2">📍 {settings.address}</p>}
          </div>
          <div>
            <p className="font-bold text-stone-700">Contacto</p>
            {settings.phone && <p className="mt-1">📞 {settings.phone}</p>}
            {settings.whatsapp && (
              <p className="mt-1">
                <a className="hover:underline" href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                  💬 WhatsApp
                </a>
              </p>
            )}
            {settings.email && <p className="mt-1">✉️ {settings.email}</p>}
            {settings.website && (
              <p className="mt-1">
                <a className="hover:underline" href={settings.website} target="_blank" rel="noreferrer">
                  🌐 {settings.website.replace(/^https?:\/\//, '')}
                </a>
              </p>
            )}
          </div>
          <div>
            <p className="font-bold text-stone-700">Horario</p>
            <ul className="mt-1 space-y-0.5">
              {(settings.hours ?? []).map((h, i) => (
                <li key={DAYS[i]} className="flex justify-between gap-4">
                  <span>{DAYS[i]}</span>
                  <span>{h.open ? `${h.from} – ${h.to}` : 'Cerrado'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-amber-900/10 py-3 text-center text-xs text-stone-500">
          <Link to="/admin" className="hover:underline">
            Acceso al panel
          </Link>
        </div>
      </footer>
    </div>
  )
}
