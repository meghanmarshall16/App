import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { PawIcon } from '../components/Icons'
import type { Trip } from '../types'
import {
  decodeShareToken,
  parseExportFile,
} from '../utils/tripShare'

interface ImportTripsPageProps {
  onImport: (trips: Trip[]) => number
}

const PENDING_IMPORT_KEY = 'trips-trips.pending-import'
const finishedHashImports = new Set<string>()

export function ImportTripsPage({ onImport }: ImportTripsPageProps) {
  const navigate = useNavigate()
  const fileInputId = useId()
  const [paste, setPaste] = useState('')
  const [status, setStatus] = useState<'idle' | 'working' | 'done'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const onImportRef = useRef(onImport)
  onImportRef.current = onImport

  async function applyTrips(trips: Trip[], sourceLabel: string) {
    if (trips.length === 0) {
      setError('No trips were found to import.')
      setStatus('idle')
      return
    }
    const count = onImportRef.current(trips)
    setStatus('done')
    setError(null)
    setMessage(
      `Imported ${count} trip${count === 1 ? '' : 's'} from ${sourceLabel}. Opening your trips…`,
    )
    window.setTimeout(() => {
      navigate('/trips', { replace: true })
    }, 900)
  }

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '').trim()
    let token = hash
    if (token) {
      try {
        sessionStorage.setItem(PENDING_IMPORT_KEY, token)
      } catch {
        // Ignore quota / private-mode failures; hash path still works once.
      }
      history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`,
      )
    } else {
      try {
        token = sessionStorage.getItem(PENDING_IMPORT_KEY) ?? ''
      } catch {
        token = ''
      }
    }
    if (!token) return

    let alive = true
    setStatus('working')
    void decodeShareToken(token)
      .then((trips) => {
        if (!alive) return
        try {
          sessionStorage.removeItem(PENDING_IMPORT_KEY)
        } catch {
          // ignore
        }
        if (finishedHashImports.has(token)) return
        finishedHashImports.add(token)
        if (trips.length === 0) {
          setError('No trips were found to import.')
          setStatus('idle')
          return
        }
        const count = onImportRef.current(trips)
        setStatus('done')
        setError(null)
        setMessage(
          `Imported ${count} trip${count === 1 ? '' : 's'} from a shared link. Opening your trips…`,
        )
        window.setTimeout(() => {
          navigate('/trips', { replace: true })
        }, 900)
      })
      .catch((err: unknown) => {
        if (!alive) return
        try {
          sessionStorage.removeItem(PENDING_IMPORT_KEY)
        } catch {
          // ignore
        }
        setStatus('idle')
        setError(
          err instanceof Error
            ? err.message
            : 'That share link could not be read.',
        )
      })

    return () => {
      alive = false
    }
  }, [navigate])

  async function handlePasteImport() {
    setStatus('working')
    setError(null)
    try {
      const trips = await decodeShareToken(paste)
      await applyTrips(trips, 'your paste')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Could not import that code.')
    }
  }

  async function handleFile(file: File) {
    setStatus('working')
    setError(null)
    try {
      const text = await file.text()
      const trips = parseExportFile(text)
      await applyTrips(trips, file.name)
    } catch (err) {
      setStatus('idle')
      setError(
        err instanceof Error
          ? err.message
          : 'That file could not be imported.',
      )
    }
  }

  return (
    <AppShell>
      <div className="page page--narrow">
        <header className="page-header page-header--stack">
          <p className="eyebrow">
            <PawIcon className="inline-paw" /> Partner import
          </p>
          <h1>Add shared trips</h1>
          <p className="page-lede">
            Open a share link from your partner, paste a share code, or upload
            the trips file they sent you.
          </p>
        </header>

        {status === 'working' ? (
          <p className="share-banner share-banner--info" role="status">
            Importing trips…
          </p>
        ) : null}
        {message ? (
          <p className="share-banner share-banner--ok" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="share-banner share-banner--error" role="alert">
            {error}
          </p>
        ) : null}

        <section className="share-panel">
          <h2>Paste a share code</h2>
          <p>
            If the link was too long to text, paste the code your partner
            copied instead.
          </p>
          <textarea
            className="share-textarea"
            rows={5}
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder="Paste the share code here"
            disabled={status === 'working' || status === 'done'}
          />
          <div className="share-panel__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={!paste.trim() || status === 'working' || status === 'done'}
              onClick={() => {
                void handlePasteImport()
              }}
            >
              Import from paste
            </button>
          </div>
        </section>

        <section className="share-panel">
          <h2>Upload a trips file</h2>
          <p>Use the `.json` file your partner downloaded from Trip&apos;s Trips.</p>
          <input
            id={fileInputId}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            disabled={status === 'working' || status === 'done'}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleFile(file)
              event.target.value = ''
            }}
          />
          <div className="share-panel__actions">
            <label htmlFor={fileInputId} className="btn btn--soft">
              Choose file
            </label>
            <Link to="/trips" className="btn btn--ghost">
              Back to trips
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
