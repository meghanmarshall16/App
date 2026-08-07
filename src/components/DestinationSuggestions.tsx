import { findDestinationGuide } from '../suggestions'
import type { ActivityInput, Trip } from '../types'
import { PawIcon } from './Icons'

interface DestinationSuggestionsProps {
  trip: Trip
  onAddPlace: (dayId: string, input: ActivityInput) => void
  onAddPacking: (label: string) => void
}

export function DestinationSuggestions({
  trip,
  onAddPlace,
  onAddPacking,
}: DestinationSuggestionsProps) {
  const guide = findDestinationGuide(trip.destination)
  const firstDayId = trip.days[0]?.id
  const existingPack = new Set(
    trip.packingList.map((item) => item.label.toLowerCase()),
  )

  return (
    <section className="panel-block">
      <header className="panel-block__header panel-block__header--stack">
        <p className="eyebrow">
          <PawIcon className="inline-paw" /> Destination brief
        </p>
        <h2>{guide.label}</h2>
        <p className="page-lede">{guide.blurb}</p>
        <p className="climate-chip">{guide.climate}</p>
      </header>

      <div className="suggest-grid">
        <div>
          <h3 className="suggest-heading">Places & plans</h3>
          <ul className="suggest-list">
            {guide.places.map((place) => (
              <li key={place.title} className="suggest-card">
                <p className="suggest-card__cat">
                  <PawIcon className="inline-paw" /> {place.category}
                </p>
                <h4>{place.title}</h4>
                <p>{place.detail}</p>
                {firstDayId ? (
                  <button
                    type="button"
                    className="btn btn--soft"
                    onClick={() =>
                      onAddPlace(firstDayId, {
                        title: place.title,
                        time: '',
                        location: trip.destination,
                        category: 'activity',
                        notes: place.detail,
                      })
                    }
                  >
                    Add to Day 1
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="suggest-heading">Local tips</h3>
          <ul className="tip-list">
            {guide.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>

          <h3 className="suggest-heading">Packing for here</h3>
          <ul className="suggest-pack">
            {guide.packing.map((item) => {
              const already = existingPack.has(item.toLowerCase())
              return (
                <li key={item}>
                  <span>{item}</span>
                  <button
                    type="button"
                    className="text-btn"
                    disabled={already}
                    onClick={() => onAddPacking(item)}
                  >
                    {already ? 'On list' : 'Add to bag'}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
