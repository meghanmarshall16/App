import { useRef } from 'react'
import { PawIcon } from './Icons'

interface DogsPhotoProps {
  photo: string | null
  onSelect: (file: File) => void
  onClear: () => void
  isCustom?: boolean
  saving?: boolean
  error?: string
  compact?: boolean
}

export function DogsPhoto({
  photo,
  onSelect,
  onClear,
  isCustom = false,
  saving = false,
  error = '',
  compact = false,
}: DogsPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className={`dogs-photo ${compact ? 'dogs-photo--compact' : ''}`}>
      <div className="dogs-photo__frame">
        {photo ? (
          <img
            src={photo}
            alt="Our two dogs sitting together on a trail"
            className="dogs-photo__img"
          />
        ) : (
          <div className="dogs-photo__placeholder">
            <div className="dogs-photo__paws" aria-hidden="true">
              <PawIcon />
              <PawIcon />
              <PawIcon />
            </div>
            <p>Add a photo of the dogs</p>
          </div>
        )}
      </div>

      <div className="dogs-photo__meta">
        {!compact ? (
          <>
            <p className="eyebrow">
              <PawIcon className="inline-paw" /> Travel companions
            </p>
            <h2>The dogs</h2>
            <p className="page-lede">
              The heart of Trip&apos;s Trips — two good pups on every adventure
              page.
            </p>
          </>
        ) : null}

        <div className="dogs-photo__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={saving}
            onClick={() => inputRef.current?.click()}
          >
            {saving ? 'Saving…' : photo ? 'Change photo' : 'Upload photo'}
          </button>
          {isCustom ? (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={saving}
              onClick={() => {
                void onClear()
              }}
            >
              Remove photo
            </button>
          ) : null}
        </div>
        {error ? <p className="form-error dogs-photo__error">{error}</p> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onSelect(file)
          event.target.value = ''
        }}
      />
    </section>
  )
}
