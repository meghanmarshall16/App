export type ActivityCategory =
  | 'flight'
  | 'lodging'
  | 'food'
  | 'activity'
  | 'transport'
  | 'note'

export interface Activity {
  id: string
  title: string
  time: string
  location: string
  category: ActivityCategory
  notes: string
}

export interface TripDay {
  id: string
  date: string
  activities: Activity[]
}

export interface PackingItem {
  id: string
  label: string
  packed: boolean
  source: 'custom' | 'suggested'
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  coverTone: CoverTone
  days: TripDay[]
  packingList: PackingItem[]
  createdAt: string
}

export type CoverTone = 'sky' | 'cloud' | 'ink' | 'mist'

export interface TripInput {
  name: string
  destination: string
  startDate: string
  endDate: string
  coverTone: CoverTone
}

export interface ActivityInput {
  title: string
  time: string
  location: string
  category: ActivityCategory
  notes: string
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  flight: 'Flight',
  lodging: 'Lodging',
  food: 'Food',
  activity: 'Activity',
  transport: 'Transport',
  note: 'Note',
}

export const COVER_TONES: { id: CoverTone; label: string }[] = [
  { id: 'sky', label: 'Sky' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'ink', label: 'Ink' },
  { id: 'mist', label: 'Mist' },
]

export type TripTab = 'calendar' | 'itinerary' | 'packing' | 'suggestions'
