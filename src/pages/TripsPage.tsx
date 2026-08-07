import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { PawIcon } from '../components/Icons'
import { countActivities, countPacked } from '../storage'
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
            <p className="eyebrow">
              <PawIcon className="inline-paw" /> Dispatch board
            </p>
            <h1>Trips</h1>
            <p className="page-lede">
              Every route lives here — open one to shape the days, bag, and
              briefing.
            </p>
          </div>
          <Link to="/trips/new" className="btn btn--primary">
            New trip
          </Link>
        </header>

        {trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icons" aria-hidden="true">
              <PawIcon />
              <PawIcon />
              <PawIcon />
            </div>
            <h2>No trips filed</h2>
            <p>
              Start with a destination and dates. Trip&apos;s Trips builds the
              days and a packing brief.
            </p>
            <Link to="/trips/new" className="btn btn--primary">
              File your first trip
            </Link>
          </div>
        ) : (
          <ul className="trip-grid">
            {trips.map((trip, index) => {
              const bag = countPacked(trip)
              return (
                <li
                  key={trip.id}
                  className={`trip-tile trip-tile--${trip.coverTone}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <Link to={`/trips/${trip.id}`} className="trip-tile__link">
                    <div className="trip-tile__glow" aria-hidden="true" />
                    <PawIcon className="trip-tile__paw" />
                    <p className="trip-tile__destination">{trip.destination}</p>
                    <h2>{trip.name}</h2>
                    <p className="trip-tile__meta">
                      {formatTripRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="trip-tile__stats">
                      {tripLengthLabel(trip)} · {countActivities(trip)} stops ·{' '}
                      {bag.packed}/{bag.total} packed
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
              )
            })}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
