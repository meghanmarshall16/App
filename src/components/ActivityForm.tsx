import { useState } from 'react'
import type { Activity, ActivityCategory, ActivityInput } from '../types'
import { CATEGORY_LABELS } from '../types'

interface ActivityFormProps {
  initial?: Activity
  submitLabel: string
  onSubmit: (input: ActivityInput) => void
  onCancel: () => void
}

const empty: ActivityInput = {
  title: '',
  time: '',
  location: '',
  category: 'activity',
  notes: '',
}

const categories = Object.keys(CATEGORY_LABELS) as ActivityCategory[]

export function ActivityForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const [form, setForm] = useState<ActivityInput>(
    initial
      ? {
          title: initial.title,
          time: initial.time,
          location: initial.location,
          category: initial.category,
          notes: initial.notes,
        }
      : empty,
  )
  const [error, setError] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Add a title for this stop.')
      return
    }
    setError('')
    onSubmit({
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
    })
  }

  return (
    <form className="panel-form panel-form--compact" onSubmit={handleSubmit}>
      <label className="field">
        <span>Title</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Sunset viewpoint"
          autoFocus
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Time</span>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Category</span>
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value as ActivityCategory,
              })
            }
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Location</span>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Neighborhood or address"
        />
      </label>

      <label className="field">
        <span>Notes</span>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Confirmation numbers, tips, reminders…"
          rows={3}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
