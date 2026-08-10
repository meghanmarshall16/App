import { useEffect, useState } from 'react'
import { compressImageFile } from '../utils/compressImage'
import {
  clearDogPhoto,
  loadDogPhoto,
  saveDogPhoto,
} from '../utils/dogPhotoStore'

const LEGACY_KEY = 'trips-trips.dogs-photo'
export const DEFAULT_DOGS_PHOTO = '/dogs.jpg'

export function useDogPhoto() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [usingDefault, setUsingDefault] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      try {
        let stored = await loadDogPhoto()

        if (!stored) {
          try {
            const legacy = localStorage.getItem(LEGACY_KEY)
            if (legacy) {
              await saveDogPhoto(legacy)
              localStorage.removeItem(LEGACY_KEY)
              stored = legacy
            }
          } catch {
            // Ignore legacy migration failures
          }
        }

        if (cancelled) return
        setPhoto(stored)

        if (!stored) {
          try {
            const response = await fetch(DEFAULT_DOGS_PHOTO, { method: 'HEAD' })
            if (!cancelled && response.ok) setUsingDefault(true)
          } catch {
            if (!cancelled) setUsingDefault(false)
          }
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  async function saveFromFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const compressed = await compressImageFile(file)
      await saveDogPhoto(compressed)
      setPhoto(compressed)
      setUsingDefault(false)
      try {
        localStorage.removeItem(LEGACY_KEY)
      } catch {
        // Ignore
      }
    } catch {
      setError('Could not save that photo. Try a smaller image.')
    } finally {
      setSaving(false)
    }
  }

  async function clear() {
    setError('')
    await clearDogPhoto()
    setPhoto(null)
    try {
      localStorage.removeItem(LEGACY_KEY)
    } catch {
      // Ignore
    }

    try {
      const response = await fetch(DEFAULT_DOGS_PHOTO, { method: 'HEAD' })
      setUsingDefault(response.ok)
    } catch {
      setUsingDefault(false)
    }
  }

  const displayPhoto = photo ?? (usingDefault ? DEFAULT_DOGS_PHOTO : null)

  return {
    photo: displayPhoto,
    saveFromFile,
    clear,
    isCustom: Boolean(photo),
    ready,
    saving,
    error,
  }
}
