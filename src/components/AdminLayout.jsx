import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

const tabs = [
  { to: '/admin', label: 'Pedidos', icon: '📋', end: true },
  { to: '/admin/productos', label: 'Productos', icon: '🥐' },
  { to: '/admin/configuracion', label: 'Negocio', icon: '⚙️' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: '👥', adminOnly: true },
]

export default function AdminLayout() {
  const { profile, logout, isAdmin } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()

  const visibleTabs = tabs.filter((t) => !t.adminOnly || isAdmin)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-bold transition sm:flex-row sm:gap-2 sm:text-sm ${
      isActive ? 'bg-amber-800 text-white' : 'text-stone-600 hover:bg-amber-100'
    }`

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-amber-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="text-2xl">🥖</span>
            )}
            <div className="min-w-0">
              <p className="truncate font-serif font-bold text-amber-900">{settings.name}</p>
              <p className="truncate text-xs text-stone-500">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/" className="btn-secondary hidden !py-1.5 text-sm sm:inline-flex">
              Ver tienda
            </NavLink>
            <button onClick={handleLogout} className="btn-secondary !py-1.5 text-sm">
              Salir
            </button>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-5xl gap-1 px-4 pb-2 sm:flex">
          {visibleTabs.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={linkClass}>
              <span>{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 pb-24 sm:pb-8">
        <Outlet />
      </main>

      {/* Barra de navegación inferior en móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="flex justify-around px-2 py-1.5">
          {visibleTabs.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={linkClass}>
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
