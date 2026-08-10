import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { PawIcon } from '../components/Icons'
import { countActivities, countPacked } from '../storage'
import type { Trip } from '../types'
import { formatTripRange, tripLengthLabel } from '../utils/dates'
import {
  buildShareUrl,
  copyText,
  decodeShareToken,
  downloadTripsFile,
  encodeShareToken,
  parseExportFile,
} from '../utils/tripShare'

interface TripsPageProps {
  trips: Trip[]
  onDelete: (tripId: string) => void
  onImport: (trips: Trip[]) => number
}

type ShareFeedback = { tone: 'ok' | 'error' | 'info'; text: string } | null

export function TripsPage({ trips, onDelete, onImport }: TripsPageProps) {
  const fileInputId = useId()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<ShareFeedback>(null)
  const [manualLink, setManualLink] = useState<string | null>(null)

  async function handleCopyShareLink() {
    if (trips.length === 0) {
      setFeedback({ tone: 'error', text: 'Add a trip before sharing.' })
      return
    }
    setBusy(true)
    setManualLink(null)
    setFeedback({ tone: 'info', text: 'Building a share link…' })
    try {
      const token = await encodeShareToken(trips)
      const url = buildShareUrl(token)
      const payload = url.length > 12000 ? token : url
      const copied = await copyText(payload)
      if (copied) {
        setFeedback({
          tone: 'ok',
          text:
            url.length > 12000
              ? 'Trips are too big for a short link. Share code copied — send that, and they can paste it on Import trips.'
              : 'Share link copied. Send it to your partner — when they open it, your trips appear on their phone.',
        })
      } else {
        setManualLink(payload)
        setFeedback({
          tone: 'info',
          text:
            url.length > 12000
              ? 'Clipboard blocked — copy the share code below, or download the trips file.'
              : 'Clipboard blocked — copy the link below, or download the trips file.',
        })
      }
    } catch {
      setFeedback({
        tone: 'error',
        text: 'Could not build a share link. Try downloading the trips file.',
      })
    } finally {
      setBusy(false)
    }
  }

  function handleDownload() {
    if (trips.length === 0) {
      setFeedback({ tone: 'error', text: 'Add a trip before downloading.' })
      return
    }
    downloadTripsFile(trips)
    setFeedback({
      tone: 'ok',
      text: 'Trips file downloaded. Send that file, and they can import it on Import trips.',
    })
  }

  async function handleFile(file: File) {
    setBusy(true)
    setFeedback({ tone: 'info', text: 'Importing…' })
    try {
      const text = await file.text()
      let incoming: Trip[]
      try {
        incoming = parseExportFile(text)
      } catch {
        incoming = await decodeShareToken(text)
      }
      const count = onImport(incoming)
      setFeedback({
        tone: 'ok',
        text: `Imported ${count} trip${count === 1 ? '' : 's'}. Matching trip IDs were updated.`,
      })
    } catch (err) {
      setFeedback({
        tone: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'That file could not be imported.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <div className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              <PawIcon className="inline-paw" /> Your trips
            </p>
            <h1>Trips</h1>
            <p className="page-lede">
              Every getaway lives here — open one to shape the days and packing
              list.
            </p>
          </div>
          <Link to="/trips/new" className="btn btn--primary">
            New trip
          </Link>
        </header>

        <section className="share-panel share-panel--banner" aria-labelledby="share-heading">
          <div>
            <h2 id="share-heading">Share with your partner</h2>
            <p>
              Trips stay on this phone until you send them. Copy a link, or
              download a file — then share again anytime you change the plans.
            </p>
          </div>
          <div className="share-panel__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() => {
                void handleCopyShareLink()
              }}
            >
              Copy share link
            </button>
            <button
              type="button"
              className="btn btn--soft"
              disabled={busy}
              onClick={handleDownload}
            >
              Download trips file
            </button>
            <Link to="/import" className="btn btn--ghost">
              Import trips
            </Link>
            <input
              id={fileInputId}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleFile(file)
                event.target.value = ''
              }}
            />
          </div>
          {feedback ? (
            <p
              className={`share-banner share-banner--${feedback.tone}`}
              role="status"
            >
              {feedback.text}
            </p>
          ) : null}
          {manualLink ? (
            <label className="share-manual">
              <span>Copy this and send it</span>
              <textarea
                className="share-textarea"
                rows={3}
                readOnly
                value={manualLink}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          ) : null}
        </section>

        {trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icons" aria-hidden="true">
              <PawIcon />
              <PawIcon />
              <PawIcon />
            </div>
            <h2>No trips yet</h2>
            <p>
              Start with a destination and dates. Trip&apos;s Trips builds the
              days and a packing list for you.
            </p>
            <Link to="/trips/new" className="btn btn--primary">
              Plan your first trip
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
