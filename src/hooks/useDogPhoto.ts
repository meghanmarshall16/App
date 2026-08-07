import { useEffect, useState } from 'react'

const STORAGE_KEY = 'trips-trips.dogs-photo'
export const DEFAULT_DOGS_PHOTO = '/dogs.jpg'

export function useDogPhoto() {
  const [photo, setPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [usingDefault, setUsingDefault] = useState(false)

  useEffect(() => {
    if (photo) {
      setUsingDefault(false)
      return
    }

    let cancelled = false
    fetch(DEFAULT_DOGS_PHOTO, { method: 'HEAD' })
      .then((response) => {
        if (!cancelled && response.ok) setUsingDefault(true)
      })
      .catch(() => {
        if (!cancelled) setUsingDefault(false)
      })

    return () => {
      cancelled = true
    }
  }, [photo])

  useEffect(() => {
    try {
      if (photo) localStorage.setItem(STORAGE_KEY, photo)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore quota / private-mode failures
    }
  }, [photo])

  function saveFromFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhoto(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function clear() {
    setPhoto(null)
    setUsingDefault(false)
  }

  const displayPhoto = photo ?? (usingDefault ? DEFAULT_DOGS_PHOTO : null)

  return { photo: displayPhoto, saveFromFile, clear, isCustom: Boolean(photo) }
}
