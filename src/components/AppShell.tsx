import { Link, NavLink } from 'react-router-dom'

interface AppShellProps {
  children: React.ReactNode
  transparent?: boolean
}

function PlaneMark() {
  return (
    <svg
      className="brand-mark__glyph"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"
      />
    </svg>
  )
}

export function AppShell({ children, transparent = false }: AppShellProps) {
  return (
    <div className={`shell ${transparent ? 'shell--transparent' : ''}`}>
      <header className="topbar">
        <Link to="/" className="brand-mark" aria-label="Trip's Trips home">
          <PlaneMark />
          <span className="brand-mark__word">Trip&apos;s Trips</span>
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
