import { eachDayOfInterval, format, parseISO } from 'date-fns'
import { packingSuggestionsFor } from './suggestions'
import type {
  Activity,
  ActivityInput,
  CoverTone,
  PackingItem,
  Trip,
  TripDay,
  TripInput,
} from './types'

const STORAGE_KEY = 'trips-trips.v1'
const LEGACY_KEY = 'waymark.trips.v1'

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export function buildDays(startDate: string, endDate: string): TripDay[] {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return []
  }

  return eachDayOfInterval({ start, end }).map((date) => ({
    id: uid('day'),
    date: format(date, 'yyyy-MM-dd'),
    activities: [],
  }))
}

export function buildPackingList(
  destination: string,
  existing: PackingItem[] = [],
): PackingItem[] {
  const suggested = packingSuggestionsFor(destination)
  const byLabel = new Map(
    existing.map((item) => [item.label.toLowerCase(), item]),
  )

  const fromSuggestions = suggested.map((label) => {
    const prior = byLabel.get(label.toLowerCase())
    if (prior) {
      byLabel.delete(label.toLowerCase())
      return { ...prior, source: 'suggested' as const }
    }
    return {
      id: uid('pack'),
      label,
      packed: false,
      source: 'suggested' as const,
    }
  })

  const customRemainder = [...byLabel.values()].filter(
    (item) => item.source === 'custom' || !suggested.includes(item.label),
  )

  return [...fromSuggestions, ...customRemainder]
}

function normalizeTrip(raw: Trip): Trip {
  return {
    ...raw,
    coverTone: (['sky', 'runway', 'dusk', 'fog'] as CoverTone[]).includes(
      raw.coverTone,
    )
      ? raw.coverTone
      : 'sky',
    packingList: Array.isArray(raw.packingList)
      ? raw.packingList
      : buildPackingList(raw.destination),
  }
}

function sampleTrip(): Trip {
  const destination = 'Lisbon, Portugal'
  const days = buildDays('2026-09-12', '2026-09-15')
  const seeded: Trip = {
    id: uid('trip'),
    name: 'Lisbon layover long weekend',
    destination,
    startDate: '2026-09-12',
    endDate: '2026-09-15',
    coverTone: 'sky',
    createdAt: new Date().toISOString(),
    days,
    packingList: buildPackingList(destination),
  }

  const plan: Record<number, ActivityInput[]> = {
    0: [
      {
        title: 'Arrive LIS',
        time: '10:40',
        location: 'Humberto Delgado Airport',
        category: 'flight',
        notes: 'Positioning into LIS · metro card at arrivals',
      },
      {
        title: 'Check in at Santa Clara loft',
        time: '14:00',
        location: 'Alfama',
        category: 'lodging',
        notes: 'Door code in email · third floor, no elevator',
      },
      {
        title: 'Sunset at Miradouro da Senhora do Monte',
        time: '18:30',
        location: 'Graça',
        category: 'activity',
        notes: 'Walk up from the loft · light jacket',
      },
    ],
    1: [
      {
        title: 'Pastéis de Belém',
        time: '09:00',
        location: 'Belém',
        category: 'food',
        notes: 'Go early to avoid the queue',
      },
      {
        title: 'Jerónimos Monastery',
        time: '10:30',
        location: 'Belém',
        category: 'activity',
        notes: 'Tickets booked · entry 10:45',
      },
      {
        title: 'Tram 28 ride',
        time: '16:00',
        location: 'Martim Moniz → Campo Ourique',
        category: 'transport',
        notes: 'Watch for pickpockets · sit on the right side',
      },
    ],
    2: [
      {
        title: 'Day trip to Sintra',
        time: '08:30',
        location: 'Rossio Station',
        category: 'transport',
        notes: 'Train every 30 min · Pena Palace timed entry 11:00',
      },
      {
        title: 'Dinner at Time Out Market',
        time: '20:00',
        location: 'Cais do Sodré',
        category: 'food',
        notes: 'Seafood stall near the center aisle',
      },
    ],
    3: [
      {
        title: 'Morning walk through LX Factory',
        time: '09:30',
        location: 'Alcântara',
        category: 'activity',
        notes: 'Bookstore + coffee before packing up',
      },
      {
        title: 'Depart LIS',
        time: '16:15',
        location: 'Humberto Delgado Airport',
        category: 'flight',
        notes: 'Arrive 2 hours early · metro to Aeroporto',
      },
    ],
  }

  seeded.days = seeded.days.map((day, index) => ({
    ...day,
    activities: (plan[index] ?? []).map((activity) => ({
      ...activity,
      id: uid('act'),
    })),
  }))

  return seeded
}

export function loadTrips(): Trip[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) {
      const seed = [sampleTrip()]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    const parsed = JSON.parse(raw) as Trip[]
    if (!Array.isArray(parsed)) return []
    const normalized = parsed.map(normalizeTrip)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    return []
  }
}

export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

export function createTrip(input: TripInput): Trip {
  const destination = input.destination.trim()
  return {
    id: uid('trip'),
    name: input.name.trim(),
    destination,
    startDate: input.startDate,
    endDate: input.endDate,
    coverTone: input.coverTone,
    createdAt: new Date().toISOString(),
    days: buildDays(input.startDate, input.endDate),
    packingList: buildPackingList(destination),
  }
}

export function updateTripMeta(trip: Trip, input: TripInput): Trip {
  const sameRange =
    trip.startDate === input.startDate && trip.endDate === input.endDate
  const destination = input.destination.trim()
  const destinationChanged =
    destination.toLowerCase() !== trip.destination.toLowerCase()

  const base: Trip = sameRange
    ? {
        ...trip,
        name: input.name.trim(),
        destination,
        coverTone: input.coverTone,
      }
    : (() => {
        const nextDays = buildDays(input.startDate, input.endDate)
        const byDate = new Map(
          trip.days.map((day) => [day.date, day.activities]),
        )
        return {
          ...trip,
          name: input.name.trim(),
          destination,
          startDate: input.startDate,
          endDate: input.endDate,
          coverTone: input.coverTone,
          days: nextDays.map((day) => ({
            ...day,
            activities: byDate.get(day.date) ?? [],
          })),
        }
      })()

  if (!destinationChanged) return base

  return {
    ...base,
    packingList: buildPackingList(destination, trip.packingList),
  }
}

export function addActivity(
  trip: Trip,
  dayId: string,
  input: ActivityInput,
): Trip {
  return {
    ...trip,
    days: trip.days.map((day) => {
      if (day.id !== dayId) return day
      const activity: Activity = { ...input, id: uid('act') }
      const activities = [...day.activities, activity].sort((a, b) =>
        a.time.localeCompare(b.time),
      )
      return { ...day, activities }
    }),
  }
}

export function updateActivity(
  trip: Trip,
  dayId: string,
  activityId: string,
  input: ActivityInput,
): Trip {
  return {
    ...trip,
    days: trip.days.map((day) => {
      if (day.id !== dayId) return day
      const activities = day.activities
        .map((activity) =>
          activity.id === activityId ? { ...activity, ...input } : activity,
        )
        .sort((a, b) => a.time.localeCompare(b.time))
      return { ...day, activities }
    }),
  }
}

export function removeActivity(
  trip: Trip,
  dayId: string,
  activityId: string,
): Trip {
  return {
    ...trip,
    days: trip.days.map((day) =>
      day.id === dayId
        ? {
            ...day,
            activities: day.activities.filter((a) => a.id !== activityId),
          }
        : day,
    ),
  }
}

export function addPackingItem(trip: Trip, label: string): Trip {
  const trimmed = label.trim()
  if (!trimmed) return trip
  if (
    trip.packingList.some(
      (item) => item.label.toLowerCase() === trimmed.toLowerCase(),
    )
  ) {
    return trip
  }

  return {
    ...trip,
    packingList: [
      ...trip.packingList,
      {
        id: uid('pack'),
        label: trimmed,
        packed: false,
        source: 'custom',
      },
    ],
  }
}

export function togglePackingItem(trip: Trip, itemId: string): Trip {
  return {
    ...trip,
    packingList: trip.packingList.map((item) =>
      item.id === itemId ? { ...item, packed: !item.packed } : item,
    ),
  }
}

export function removePackingItem(trip: Trip, itemId: string): Trip {
  return {
    ...trip,
    packingList: trip.packingList.filter((item) => item.id !== itemId),
  }
}

export function refreshPackingSuggestions(trip: Trip): Trip {
  return {
    ...trip,
    packingList: buildPackingList(trip.destination, trip.packingList),
  }
}

export function countActivities(trip: Trip): number {
  return trip.days.reduce((sum, day) => sum + day.activities.length, 0)
}

export function countPacked(trip: Trip): { packed: number; total: number } {
  const total = trip.packingList.length
  const packed = trip.packingList.filter((item) => item.packed).length
  return { packed, total }
}

export function defaultCoverTone(): CoverTone {
  return 'sky'
}
