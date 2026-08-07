import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { countActivities } from '../storage'
import type { Trip } from '../types'
import { formatTripRange, tripLengthLabel } from '../utils/dates'

interface TripsPageProps {
  trips: Trip[]
  onDelete: (tripId: string) => void
}

export function TripsPage({ trips, onDelete }: TripsPageProps) {
  return (
    <AppShell>
      <div className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Your journeys</p>
            <h1>Trips</h1>
            <p className="page-lede">
              Every itinerary lives here — open one to shape the days ahead.
            </p>
          </div>
          <Link to="/trips/new" className="btn btn--primary">
            New trip
          </Link>
        </header>

        {trips.length === 0 ? (
          <div className="empty-state">
            <h2>No trips yet</h2>
            <p>Start with a destination and a few dates. Waymark builds the days.</p>
            <Link to="/trips/new" className="btn btn--primary">
              Create your first trip
            </Link>
          </div>
        ) : (
          <ul className="trip-grid">
            {trips.map((trip, index) => (
              <li
                key={trip.id}
                className={`trip-tile trip-tile--${trip.coverTone}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <Link to={`/trips/${trip.id}`} className="trip-tile__link">
                  <div className="trip-tile__glow" aria-hidden="true" />
                  <p className="trip-tile__destination">{trip.destination}</p>
                  <h2>{trip.name}</h2>
                  <p className="trip-tile__meta">
                    {formatTripRange(trip.startDate, trip.endDate)}
                  </p>
                  <p className="trip-tile__stats">
                    {tripLengthLabel(trip)} · {countActivities(trip)} stops
                  </p>
                </Link>
                <button
                  type="button"
                  className="trip-tile__delete"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete “${trip.name}”? This cannot be undone.`,
                      )
                    ) {
                      onDelete(trip.id)
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
