import { useId, useState } from 'react'
import { copyText } from '../utils/tripShare'
import type { SyncStatus } from '../utils/cloudSync'

interface CloudSyncPanelProps {
  cloudReady: boolean
  spaceId: string | null
  syncStatus: SyncStatus
  syncError: string | null
  onCreate: () => Promise<string>
  onJoin: (code: string) => Promise<string>
  onDisconnect: () => void
}

function statusLabel(status: SyncStatus, spaceId: string | null): string {
  if (!spaceId) return 'Saving on this phone only'
  switch (status) {
    case 'connecting':
      return 'Syncing with the cloud…'
    case 'synced':
      return 'Live sync on'
    case 'error':
      return 'Cloud sync hit a snag'
    case 'offline':
      return 'Offline — changes stay on this phone for now'
    default:
      return 'Saving on this phone only'
  }
}

export function CloudSyncPanel({
  cloudReady,
  spaceId,
  syncStatus,
  syncError,
  onCreate,
  onJoin,
  onDisconnect,
}: CloudSyncPanelProps) {
  const joinId = useId()
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const id = await onCreate()
      const copied = await copyText(id)
      setMessage(
        copied
          ? `Cloud space ${id} is ready — code copied. Send it to your partner.`
          : `Cloud space ${id} is ready. Send that code to your partner.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start cloud sync.')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const id = await onJoin(joinCode)
      setMessage(`Joined cloud space ${id}. Trips will stay in sync.`)
      setJoinCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join that space.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCopyCode() {
    if (!spaceId) return
    const copied = await copyText(spaceId)
    setMessage(
      copied
        ? `Space code ${spaceId} copied.`
        : `Your space code is ${spaceId}.`,
    )
  }

  return (
    <section className="share-panel share-panel--banner" aria-labelledby="cloud-heading">
      <div>
        <h2 id="cloud-heading">Cloud sync</h2>
        <p>
          Save trips online so anyone with your space code sees the same
          itineraries — and updates land on every phone.
        </p>
        <p className="share-status" role="status">
          {statusLabel(syncStatus, spaceId)}
          {spaceId ? ` · Space ${spaceId}` : null}
        </p>
      </div>

      {!cloudReady ? (
        <div className="share-banner share-banner--info">
          <p>
            Cloud sync needs a free Supabase project. Create one, run{' '}
            <code>supabase/schema.sql</code>, then add{' '}
            <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> in Vercel and redeploy.
          </p>
        </div>
      ) : null}

      {cloudReady && !spaceId ? (
        <div className="share-panel__stack">
          <div className="share-panel__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() => {
                void handleCreate()
              }}
            >
              Start cloud sync
            </button>
          </div>
          <label className="share-manual" htmlFor={joinId}>
            <span>Or join with a code</span>
            <div className="share-panel__actions">
              <input
                id={joinId}
                className="share-input"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                disabled={busy}
              />
              <button
                type="button"
                className="btn btn--soft"
                disabled={busy || !joinCode.trim()}
                onClick={() => {
                  void handleJoin()
                }}
              >
                Join space
              </button>
            </div>
          </label>
        </div>
      ) : null}

      {cloudReady && spaceId ? (
        <div className="share-panel__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={busy}
            onClick={() => {
              void handleCopyCode()
            }}
          >
            Copy space code
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={onDisconnect}
          >
            Use this phone only
          </button>
        </div>
      ) : null}

      {message ? (
        <p className="share-banner share-banner--ok" role="status">
          {message}
        </p>
      ) : null}
      {error || syncError ? (
        <p className="share-banner share-banner--error" role="alert">
          {error ?? syncError}
        </p>
      ) : null}
    </section>
  )
}
