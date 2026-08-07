import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'

export function LandingPage() {
  return (
    <AppShell transparent>
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <div className="hero__wash" />
          <div className="hero__grain" />
        </div>
        <div className="hero__content">
          <p className="hero__brand">Waymark</p>
          <h1 className="hero__headline">Your trip, drawn day by day.</h1>
          <p className="hero__lede">
            Keep flights, meals, and moments in one calm itinerary — ready
            whenever the road turns.
          </p>
          <div className="hero__actions">
            <Link to="/trips" className="btn btn--primary btn--large">
              Open my trips
            </Link>
            <Link to="/trips/new" className="btn btn--ghost-light btn--large">
              Plan a new trip
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
