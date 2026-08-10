import { useCallback, useEffect, useRef, useState } from 'react'
import type { ActivityInput, Trip, TripInput } from '../types'
import {
  addActivity,
  addPackingItem,
  createTrip,
  loadTrips,
  refreshPackingSuggestions,
  removeActivity,
  removePackingItem,
  saveTrips,
  togglePackingItem,
  updateActivity,
  updateTripMeta,
} from '../storage'
import { isCloudConfigured } from '../lib/supabase'
import {
  createSpace,
  fetchSpace,
  joinSpace,
  loadSavedSpaceId,
  pushSpace,
  saveSpaceId,
  subscribeToSpace,
  type SyncStatus,
} from '../utils/cloudSync'
import { mergeTrips } from '../utils/tripShare'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips())
  const [spaceId, setSpaceId] = useState<string | null>(() => loadSavedSpaceId())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    loadSavedSpaceId() && isCloudConfigured() ? 'connecting' : 'local',
  )
  const [syncError, setSyncError] = useState<string | null>(null)
  const skipNextPush = useRef(false)
  const remoteUpdatedAt = useRef<string | null>(null)
  const tripsRef = useRef(trips)
  tripsRef.current = trips

  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  useEffect(() => {
    if (!spaceId || !isCloudConfigured()) return

    let cancelled = false
    setSyncStatus('connecting')
    setSyncError(null)

    void fetchSpace(spaceId)
      .then((space) => {
        if (cancelled) return
        if (!space) {
          saveSpaceId(null)
          setSpaceId(null)
          setSyncStatus('local')
          setSyncError('That cloud space no longer exists. Create or join one again.')
          return
        }
        remoteUpdatedAt.current = space.updatedAt
        skipNextPush.current = true
        setTrips(space.trips)
        setSyncStatus('synced')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setSyncStatus('error')
        setSyncError(
          error instanceof Error ? error.message : 'Could not load cloud trips.',
        )
      })

    const unsubscribe = subscribeToSpace(
      spaceId,
      (space) => {
        if (space.updatedAt === remoteUpdatedAt.current) return
        remoteUpdatedAt.current = space.updatedAt
        skipNextPush.current = true
        setTrips(space.trips)
        setSyncStatus('synced')
        setSyncError(null)
      },
      (message) => {
        setSyncStatus('error')
        setSyncError(message)
      },
    )

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [spaceId])

  useEffect(() => {
    if (!spaceId || !isCloudConfigured()) return
    if (skipNextPush.current) {
      skipNextPush.current = false
      return
    }

    setSyncStatus((current) => (current === 'local' ? current : 'connecting'))
    const timer = window.setTimeout(() => {
      void pushSpace(spaceId, trips)
        .then((space) => {
          remoteUpdatedAt.current = space.updatedAt
          setSyncStatus('synced')
          setSyncError(null)
        })
        .catch((error: unknown) => {
          setSyncStatus('error')
          setSyncError(
            error instanceof Error
              ? error.message
              : 'Could not save trips to the cloud.',
          )
        })
    }, 450)

    return () => window.clearTimeout(timer)
  }, [trips, spaceId])

  const startCloudSpace = useCallback(async () => {
    if (!isCloudConfigured()) {
      throw new Error(
        'Cloud sync is not set up yet. Add Supabase keys, then redeploy.',
      )
    }
    setSyncStatus('connecting')
    setSyncError(null)
    const space = await createSpace(tripsRef.current)
    remoteUpdatedAt.current = space.updatedAt
    skipNextPush.current = true
    setSpaceId(space.id)
    setTrips(space.trips)
    setSyncStatus('synced')
    return space.id
  }, [])

  const connectCloudSpace = useCallback(async (code: string) => {
    if (!isCloudConfigured()) {
      throw new Error(
        'Cloud sync is not set up yet. Add Supabase keys, then redeploy.',
      )
    }
    setSyncStatus('connecting')
    setSyncError(null)
    const space = await joinSpace(code)
    remoteUpdatedAt.current = space.updatedAt
    skipNextPush.current = true
    setSpaceId(space.id)
    setTrips(space.trips)
    setSyncStatus('synced')
    return space.id
  }, [])

  const disconnectCloudSpace = useCallback(() => {
    saveSpaceId(null)
    setSpaceId(null)
    remoteUpdatedAt.current = null
    setSyncStatus('local')
    setSyncError(null)
  }, [])

  const addTrip = useCallback((input: TripInput) => {
    const trip = createTrip(input)
    setTrips((current) => [trip, ...current])
    return trip
  }, [])

  const editTrip = useCallback((tripId: string, input: TripInput) => {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId ? updateTripMeta(trip, input) : trip,
      ),
    )
  }, [])

  const deleteTrip = useCallback((tripId: string) => {
    setTrips((current) => current.filter((trip) => trip.id !== tripId))
  }, [])

  const createActivity = useCallback(
    (tripId: string, dayId: string, input: ActivityInput) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId ? addActivity(trip, dayId, input) : trip,
        ),
      )
    },
    [],
  )

  const editActivity = useCallback(
    (
      tripId: string,
      dayId: string,
      activityId: string,
      input: ActivityInput,
    ) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? updateActivity(trip, dayId, activityId, input)
            : trip,
        ),
      )
    },
    [],
  )

  const deleteActivity = useCallback(
    (tripId: string, dayId: string, activityId: string) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? removeActivity(trip, dayId, activityId)
            : trip,
        ),
      )
    },
    [],
  )

  const createPackingItem = useCallback((tripId: string, label: string) => {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId ? addPackingItem(trip, label) : trip,
      ),
    )
  }, [])

  const flipPackingItem = useCallback((tripId: string, itemId: string) => {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId ? togglePackingItem(trip, itemId) : trip,
      ),
    )
  }, [])

  const deletePackingItem = useCallback((tripId: string, itemId: string) => {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId ? removePackingItem(trip, itemId) : trip,
      ),
    )
  }, [])

  const syncPackingSuggestions = useCallback((tripId: string) => {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId ? refreshPackingSuggestions(trip) : trip,
      ),
    )
  }, [])

  const getTrip = useCallback(
    (tripId: string) => trips.find((trip) => trip.id === tripId),
    [trips],
  )

  const importIncomingTrips = useCallback((incoming: Trip[]) => {
    setTrips((current) => mergeTrips(current, incoming))
    return incoming.length
  }, [])

  return {
    trips,
    spaceId,
    syncStatus,
    syncError,
    cloudReady: isCloudConfigured(),
    startCloudSpace,
    connectCloudSpace,
    disconnectCloudSpace,
    addTrip,
    editTrip,
    deleteTrip,
    createActivity,
    editActivity,
    deleteActivity,
    createPackingItem,
    flipPackingItem,
    deletePackingItem,
    syncPackingSuggestions,
    getTrip,
    importIncomingTrips,
  }
}
