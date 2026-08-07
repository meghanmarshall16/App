import { useState } from 'react'
import { countPacked } from '../storage'
import type { Trip } from '../types'

interface PackingListProps {
  trip: Trip
  onAdd: (label: string) => void
  onToggle: (itemId: string) => void
  onRemove: (itemId: string) => void
  onRefreshSuggestions: () => void
}

export function PackingList({
  trip,
  onAdd,
  onToggle,
  onRemove,
  onRefreshSuggestions,
}: PackingListProps) {
  const [label, setLabel] = useState('')
  const { packed, total } = countPacked(trip)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!label.trim()) return
    onAdd(label)
    setLabel('')
  }

  return (
    <section className="panel-block">
      <header className="panel-block__header">
        <div>
          <p className="eyebrow">Before pushback</p>
          <h2>Packing list</h2>
          <p className="page-lede">
            Crew essentials plus gear matched to {trip.destination}.{' '}
            {total === 0
              ? 'Add your first item.'
              : `${packed} of ${total} packed.`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn--soft"
          onClick={onRefreshSuggestions}
        >
          Refresh suggestions
        </button>
      </header>

      {total > 0 ? (
        <div className="pack-progress" aria-hidden="true">
          <div
            className="pack-progress__bar"
            style={{ width: `${Math.round((packed / total) * 100)}%` }}
          />
        </div>
      ) : null}

      <form className="pack-add" onSubmit={handleSubmit}>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add something to the bag…"
          aria-label="New packing item"
        />
        <button type="submit" className="btn btn--primary">
          Add
        </button>
      </form>

      {trip.packingList.length === 0 ? (
        <p className="day__empty">
          No items yet — refresh suggestions or add your own.
        </p>
      ) : (
        <ul className="pack-list">
          {trip.packingList.map((item) => (
            <li
              key={item.id}
              className={`pack-item ${item.packed ? 'is-packed' : ''}`}
            >
              <label className="pack-item__check">
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={() => onToggle(item.id)}
                />
                <span>{item.label}</span>
              </label>
              <div className="pack-item__meta">
                {item.source === 'suggested' ? (
                  <span className="pack-tag">Suggested</span>
                ) : (
                  <span className="pack-tag pack-tag--custom">Custom</span>
                )}
                <button
                  type="button"
                  className="text-btn text-btn--danger"
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
