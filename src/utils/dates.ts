import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { Trip } from '../types'

export function formatTripRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return ''
  }

  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameMonth) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`
  }

  if (sameYear) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
  }

  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`
}

export function formatDayHeading(date: string): string {
  const parsed = parseISO(date)
  if (Number.isNaN(parsed.getTime())) return date
  return format(parsed, 'EEEE, MMM d')
}

export function tripLengthLabel(trip: Trip): string {
  const nights = differenceInCalendarDays(
    parseISO(trip.endDate),
    parseISO(trip.startDate),
  )
  const days = nights + 1
  if (days === 1) return '1 day'
  return `${days} days`
}

export function formatTimeDisplay(time: string): string {
  if (!time) return 'Anytime'
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return format(date, 'h:mm a')
}
