import { useCallback, useEffect, useState } from 'react'
import type { ActivityInput, Trip, TripInput } from '../types'
import {
  addActivity,
  createTrip,
  loadTrips,
  removeActivity,
  saveTrips,
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

  const getTrip = useCallback(
    (tripId: string) => trips.find((trip) => trip.id === tripId),
    [trips],
  )

  return {
    trips,
    addTrip,
    editTrip,
    deleteTrip,
    createActivity,
    editActivity,
    deleteActivity,
    getTrip,
  }
}
