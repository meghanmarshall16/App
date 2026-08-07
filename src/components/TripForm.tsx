import { useState } from 'react'
import type { CoverTone, TripInput } from '../types'
import { COVER_TONES } from '../types'
import { defaultCoverTone } from '../storage'

interface TripFormProps {
  initial?: TripInput
  submitLabel: string
  onSubmit: (input: TripInput) => void
  onCancel?: () => void
}

const empty: TripInput = {
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
  coverTone: defaultCoverTone(),
}

export function TripForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: TripFormProps) {
  const [form, setForm] = useState<TripInput>(initial ?? empty)
  const [error, setError] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.destination.trim()) {
      setError('Give the trip a name and destination.')
      return
    }
    if (!form.startDate || !form.endDate) {
      setError('Choose start and end dates.')
      return
    }
    if (form.endDate < form.startDate) {
      setError('End date must be on or after the start date.')
      return
    }
    setError('')
    onSubmit(form)
  }

  return (
    <form className="panel-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Trip name</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Lisbon long weekend"
          autoFocus
        />
      </label>

      <label className="field">
        <span>Destination</span>
        <input
          type="text"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
          placeholder="Lisbon, Portugal"
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Start</span>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </label>
        <label className="field">
          <span>End</span>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </label>
      </div>

      <fieldset className="tone-picker">
        <legend>Cover tone</legend>
        <div className="tone-picker__options">
          {COVER_TONES.map((tone) => (
            <label
              key={tone.id}
              className={`tone-swatch tone-swatch--${tone.id} ${
                form.coverTone === tone.id ? 'is-selected' : ''
              }`}
            >
              <input
                type="radio"
                name="coverTone"
                value={tone.id}
                checked={form.coverTone === tone.id}
                onChange={() =>
                  setForm({ ...form, coverTone: tone.id as CoverTone })
                }
              />
              <span>{tone.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
