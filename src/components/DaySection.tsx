import { useState } from 'react'
import type { ActivityInput, TripDay } from '../types'
import { formatDayHeading } from '../utils/dates'
import { ActivityForm } from './ActivityForm'
import { ActivityItem } from './ActivityItem'
import { PawIcon } from './Icons'

interface DaySectionProps {
  day: TripDay
  index: number
  onAdd: (input: ActivityInput) => void
  onUpdate: (activityId: string, input: ActivityInput) => void
  onDelete: (activityId: string) => void
}

export function DaySection({
  day,
  index,
  onAdd,
  onUpdate,
  onDelete,
}: DaySectionProps) {
  const [adding, setAdding] = useState(false)

  return (
    <section className="day" style={{ animationDelay: `${index * 60}ms` }}>
      <header className="day__header">
        <div>
          <p className="day__eyebrow">
            <PawIcon className="inline-paw" /> Day {index + 1}
          </p>
          <h2 className="day__title">{formatDayHeading(day.date)}</h2>
        </div>
        <button
          type="button"
          className="btn btn--soft"
          onClick={() => setAdding(true)}
          disabled={adding}
        >
          Add stop
        </button>
      </header>

      {adding ? (
        <div className="day__composer">
          <ActivityForm
            submitLabel="Add to day"
            onSubmit={(input) => {
              onAdd(input)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : null}

      {day.activities.length === 0 && !adding ? (
        <p className="day__empty">
          <PawIcon className="inline-paw" /> No stops yet — add your first plan
          for this day.
        </p>
      ) : (
        <ol className="day__list">
          {day.activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onUpdate={(input) => onUpdate(activity.id, input)}
              onDelete={() => onDelete(activity.id)}
            />
          ))}
        </ol>
      )}
    </section>
  )
}
