import { useState } from 'react'
import type { Activity, ActivityInput } from '../types'
import { CATEGORY_LABELS } from '../types'
import { formatTimeDisplay } from '../utils/dates'
import { ActivityForm } from './ActivityForm'

interface ActivityItemProps {
  activity: Activity
  onUpdate: (input: ActivityInput) => void
  onDelete: () => void
}

export function ActivityItem({
  activity,
  onUpdate,
  onDelete,
}: ActivityItemProps) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="activity activity--editing">
        <ActivityForm
          initial={activity}
          submitLabel="Save stop"
          onSubmit={(input) => {
            onUpdate(input)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className={`activity activity--${activity.category}`}>
      <div className="activity__time">{formatTimeDisplay(activity.time)}</div>
      <div className="activity__body">
        <div className="activity__top">
          <span className="activity__category">
            {CATEGORY_LABELS[activity.category]}
          </span>
          <div className="activity__actions">
            <button
              type="button"
              className="text-btn"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button type="button" className="text-btn text-btn--danger" onClick={onDelete}>
              Remove
            </button>
          </div>
        </div>
        <h3 className="activity__title">{activity.title}</h3>
        {activity.location ? (
          <p className="activity__location">{activity.location}</p>
        ) : null}
        {activity.notes ? (
          <p className="activity__notes">{activity.notes}</p>
        ) : null}
      </div>
    </li>
  )
}
