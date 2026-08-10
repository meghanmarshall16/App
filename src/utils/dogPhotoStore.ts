const DB_NAME = 'trips-trips'
const STORE_NAME = 'photos'
const PHOTO_KEY = 'dogs'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('Could not open photo storage.'))
  })
}

export async function loadDogPhoto(): Promise<string | null> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(PHOTO_KEY)
      request.onsuccess = () => {
        const value = request.result
        resolve(typeof value === 'string' ? value : null)
      }
      request.onerror = () =>
        reject(request.error ?? new Error('Could not load photo.'))
    })
  } catch {
    return null
  }
}

export async function saveDogPhoto(dataUrl: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(dataUrl, PHOTO_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () =>
      reject(tx.error ?? new Error('Could not save photo.'))
    tx.onabort = () =>
      reject(tx.error ?? new Error('Could not save photo.'))
  })
}

export async function clearDogPhoto(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(PHOTO_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () =>
        reject(tx.error ?? new Error('Could not clear photo.'))
    })
  } catch {
    // Ignore clear failures
  }
}
