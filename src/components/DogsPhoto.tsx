import { useRef } from 'react'
import { PawIcon } from './Icons'

interface DogsPhotoProps {
  photo: string | null
  onSelect: (file: File) => void
  onClear: () => void
  compact?: boolean
}

export function DogsPhoto({
  photo,
  onSelect,
  onClear,
  compact = false,
}: DogsPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className={`dogs-photo ${compact ? 'dogs-photo--compact' : ''}`}>
      <div className="dogs-photo__frame">
        {photo ? (
          <img src={photo} alt="Our dogs" className="dogs-photo__img" />
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
              Drop in a favorite photo — they belong on every trip page.
            </p>
          </>
        ) : null}

        <div className="dogs-photo__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => inputRef.current?.click()}
          >
            {photo ? 'Change photo' : 'Upload photo'}
          </button>
          {photo ? (
            <button type="button" className="btn btn--ghost" onClick={onClear}>
              Remove
            </button>
          ) : null}
        </div>
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
