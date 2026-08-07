import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DaySection } from '../components/DaySection'
import { TripForm } from '../components/TripForm'
import { countActivities } from '../storage'
import type { ActivityInput, Trip, TripInput } from '../types'
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
}

export function TripDetailPage({
  getTrip,
  onEdit,
  onDelete,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: TripDetailPageProps) {
  const { tripId = '' } = useParams()
  const navigate = useNavigate()
  const trip = getTrip(tripId)
  const [editing, setEditing] = useState(false)

  if (!trip) {
    return <Navigate to="/trips" replace />
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
            {tripLengthLabel(trip)} · {countActivities(trip)} stops
          </p>
          <div className="trip-hero__actions">
            <button
              type="button"
              className="btn btn--ghost-light"
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? 'Close editor' : 'Edit trip'}
            </button>
            <button
              type="button"
              className="btn btn--ghost-light"
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
      </div>
    </AppShell>
  )
}
