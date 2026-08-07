import { Link, NavLink } from 'react-router-dom'

interface AppShellProps {
  children: React.ReactNode
  transparent?: boolean
}

export function AppShell({ children, transparent = false }: AppShellProps) {
  return (
    <div className={`shell ${transparent ? 'shell--transparent' : ''}`}>
      <header className="topbar">
        <Link to="/" className="brand-mark" aria-label="Waymark home">
          <span className="brand-mark__star" aria-hidden="true" />
          <span className="brand-mark__word">Waymark</span>
        </Link>
        <nav className="topbar__nav" aria-label="Primary">
          <NavLink to="/trips" className="topbar__link">
            Trips
          </NavLink>
          <NavLink to="/trips/new" className="topbar__cta">
            New trip
          </NavLink>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
