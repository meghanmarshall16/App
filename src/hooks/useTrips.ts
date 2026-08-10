import { useCallback, useEffect, useState } from 'react'
import type { ActivityInput, Trip, TripInput } from '../types'
import {
  addActivity,
  addPackingItem,
  createTrip,
  createTripFromImport,
  loadTrips,
  refreshPackingSuggestions,
  removeActivity,
  removePackingItem,
  saveTrips,
  togglePackingItem,
  updateActivity,
  updateTripMeta,
} from '../storage'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips())

  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  const addTrip = useCallback((input: TripInput) => {
    const trip = createTrip(input)
    setTrips((current) => [trip, ...current])
    return trip
  }, [])

  const importTrip = useCallback(
    (input: {
      name: string
      destination: string
      startDate: string
      endDate: string
      days: { date: string; activities: ActivityInput[] }[]
    }) => {
      const trip = createTripFromImport(input)
      setTrips((current) => [trip, ...current])
      return trip
    },
    [],
  )

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

  return {
    trips,
    addTrip,
    importTrip,
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
  }
}
