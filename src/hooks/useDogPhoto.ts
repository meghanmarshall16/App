import { useEffect, useState } from 'react'

const STORAGE_KEY = 'trips-trips.dogs-photo'

export function useDogPhoto() {
  const [photo, setPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })

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
  }

  return { photo, saveFromFile, clear }
}
