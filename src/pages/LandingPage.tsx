import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'

export function LandingPage() {
  return (
    <AppShell transparent>
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <div className="hero__runway" />
          <div className="hero__plane" />
          <div className="hero__wash" />
          <div className="hero__grain" />
        </div>
        <div className="hero__content">
          <p className="hero__brand">Trip&apos;s Trips</p>
          <h1 className="hero__headline">Flight plan for every layover.</h1>
          <p className="hero__lede">
            Built for a pilot&apos;s calendar — day-by-day itineraries, packing
            lists, and destination briefings before you land.
          </p>
          <div className="hero__actions">
            <Link to="/trips" className="btn btn--primary btn--large">
              Open my trips
            </Link>
            <Link to="/trips/new" className="btn btn--ghost-light btn--large">
              File a new trip
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
