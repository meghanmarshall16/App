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

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  coverTone: CoverTone
  days: TripDay[]
  createdAt: string
}

export type CoverTone = 'ocean' | 'sunset' | 'forest' | 'slate'

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
  { id: 'ocean', label: 'Ocean' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'forest', label: 'Forest' },
  { id: 'slate', label: 'Slate' },
]
