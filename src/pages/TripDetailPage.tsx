import { useEffect, useState } from 'react'
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DaySection } from '../components/DaySection'
import { PackingList } from '../components/PackingList'
import { TripCalendar } from '../components/TripCalendar'
import { TripForm } from '../components/TripForm'
import { countActivities, countPacked } from '../storage'
import type { ActivityInput, Trip, TripInput, TripTab } from '../types'
import { formatTripRange, tripLengthLabel } from '../utils/dates'

interface TripDetailPageProps {
  getTrip: (id: string) => Trip | undefined
  onEdit: (tripId: string, input: TripInput) => void
  onDelete: (tripId: string) => void
  onAddActivity: (tripId: string, dayId: string, input: ActivityInput) => void
  onEditActivity: (
    tripId: string,
    dayId: string,
    activityId: string,
    input: ActivityInput,
  ) => void
  onDeleteActivity: (tripId: string, dayId: string, activityId: string) => void
  onAddPackingItem: (tripId: string, label: string) => void
  onTogglePackingItem: (tripId: string, itemId: string) => void
  onRemovePackingItem: (tripId: string, itemId: string) => void
  onRefreshPacking: (tripId: string) => void
}

function parseTab(value: string | null): TripTab {
  if (value === 'calendar' || value === 'itinerary' || value === 'packing') {
    return value
  }
  return 'itinerary'
}

export function TripDetailPage({
  getTrip,
  onEdit,
  onDelete,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onAddPackingItem,
  onTogglePackingItem,
  onRemovePackingItem,
  onRefreshPacking,
}: TripDetailPageProps) {
  const { tripId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const trip = getTrip(tripId)
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState<TripTab>(() => parseTab(searchParams.get('tab')))

  useEffect(() => {
    setTab(parseTab(searchParams.get('tab')))
  }, [searchParams])

  if (!trip) {
    return <Navigate to="/trips" replace />
  }

  const bag = countPacked(trip)

  function selectTab(next: TripTab) {
    setTab(next)
    setSearchParams(next === 'itinerary' ? {} : { tab: next }, { replace: true })
  }

  return (
    <AppShell>
      <div className={`trip-hero trip-hero--${trip.coverTone}`}>
        <div className="trip-hero__inner">
          <Link to="/trips" className="back-link">
            ← All trips
          </Link>
          <p className="trip-hero__destination">{trip.destination}</p>
          <h1>{trip.name}</h1>
          <p className="trip-hero__meta">
            {formatTripRange(trip.startDate, trip.endDate)} ·{' '}
            {tripLengthLabel(trip)} · {countActivities(trip)} stops ·{' '}
            {bag.packed}/{bag.total} packed
          </p>
          <div className="trip-hero__actions">
            <button
              type="button"
              className="btn btn--hero"
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? 'Close editor' : 'Edit trip'}
            </button>
            <button
              type="button"
              className="btn btn--hero"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete “${trip.name}”? This cannot be undone.`,
                  )
                ) {
                  onDelete(trip.id)
                  navigate('/trips')
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="page page--trip">
        {editing ? (
          <div className="editor-panel">
            <h2>Edit trip details</h2>
            <TripForm
              initial={{
                name: trip.name,
                destination: trip.destination,
                startDate: trip.startDate,
                endDate: trip.endDate,
                coverTone: trip.coverTone,
              }}
              submitLabel="Save changes"
              onCancel={() => setEditing(false)}
              onSubmit={(input) => {
                onEdit(trip.id, input)
                setEditing(false)
              }}
            />
          </div>
        ) : null}

        <div className="trip-tabs" role="tablist" aria-label="Trip sections">
          {(
            [
              ['calendar', 'Calendar'],
              ['itinerary', 'Itinerary'],
              ['packing', 'Packing'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`trip-tabs__btn ${tab === id ? 'is-active' : ''}`}
              onClick={() => selectTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'calendar' ? (
          <TripCalendar
            trip={trip}
            onAdd={(dayId, input) => onAddActivity(trip.id, dayId, input)}
            onUpdate={(dayId, activityId, input) =>
              onEditActivity(trip.id, dayId, activityId, input)
            }
            onDelete={(dayId, activityId) =>
              onDeleteActivity(trip.id, dayId, activityId)
            }
          />
        ) : null}

        {tab === 'itinerary' ? (
          <div className="day-stack">
            {trip.days.map((day, index) => (
              <DaySection
                key={day.id}
                day={day}
                index={index}
                onAdd={(input) => onAddActivity(trip.id, day.id, input)}
                onUpdate={(activityId, input) =>
                  onEditActivity(trip.id, day.id, activityId, input)
                }
                onDelete={(activityId) =>
                  onDeleteActivity(trip.id, day.id, activityId)
                }
              />
            ))}
          </div>
        ) : null}

        {tab === 'packing' ? (
          <PackingList
            trip={trip}
            onAdd={(label) => onAddPackingItem(trip.id, label)}
            onToggle={(itemId) => onTogglePackingItem(trip.id, itemId)}
            onRemove={(itemId) => onRemovePackingItem(trip.id, itemId)}
            onRefreshSuggestions={() => onRefreshPacking(trip.id)}
          />
        ) : null}
      </div>
    </AppShell>
  )
}
