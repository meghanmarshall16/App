import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useMemo, useState } from 'react'
import type { ActivityInput, Trip, TripDay } from '../types'
import { formatDayHeading, formatTimeDisplay } from '../utils/dates'
import { DaySection } from './DaySection'
import { PawIcon } from './Icons'

interface TripCalendarProps {
  trip: Trip
  onAdd: (dayId: string, input: ActivityInput) => void
  onUpdate: (dayId: string, activityId: string, input: ActivityInput) => void
  onDelete: (dayId: string, activityId: string) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function TripCalendar({
  trip,
  onAdd,
  onUpdate,
  onDelete,
}: TripCalendarProps) {
  const tripStart = parseISO(trip.startDate)
  const daysByDate = useMemo(() => {
    const map = new Map<string, TripDay>()
    for (const day of trip.days) map.set(day.date, day)
    return map
  }, [trip.days])

  const [monthCursor, setMonthCursor] = useState(() =>
    startOfMonth(
      Number.isNaN(tripStart.getTime()) ? new Date() : tripStart,
    ),
  )
  const [selectedDate, setSelectedDate] = useState(
    () => trip.days[0]?.date ?? trip.startDate,
  )

  const selectedDay = daysByDate.get(selectedDate) ?? trip.days[0]
  const selectedIndex = trip.days.findIndex(
    (day) => day.date === selectedDay?.date,
  )

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor))
    const end = endOfWeek(endOfMonth(monthCursor))
    return eachDayOfInterval({ start, end })
  }, [monthCursor])

  return (
    <section className="trip-calendar">
      <header className="trip-calendar__header">
        <div>
          <p className="eyebrow">
            <PawIcon className="inline-paw" /> Trip calendar
          </p>
          <h2>{format(monthCursor, 'MMMM yyyy')}</h2>
          <p className="page-lede">
            Your trip days are highlighted. Tap a day to see or add stops.
          </p>
        </div>
        <div className="trip-calendar__nav">
          <button
            type="button"
            className="btn btn--soft"
            onClick={() => setMonthCursor((value) => addMonths(value, -1))}
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            className="btn btn--soft"
            onClick={() =>
              setMonthCursor(
                startOfMonth(
                  Number.isNaN(tripStart.getTime()) ? new Date() : tripStart,
                ),
              )
            }
          >
            Trip start
          </button>
          <button
            type="button"
            className="btn btn--soft"
            onClick={() => setMonthCursor((value) => addMonths(value, 1))}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </header>

      <div className="cal-grid" role="grid" aria-label="Trip month">
        {WEEKDAYS.map((day) => (
          <div key={day} className="cal-grid__weekday" role="columnheader">
            {day}
          </div>
        ))}
        {calendarDays.map((date) => {
          const key = format(date, 'yyyy-MM-dd')
          const tripDay = daysByDate.get(key)
          const inTrip = Boolean(tripDay)
          const stopCount = tripDay?.activities.length ?? 0
          const isSelected = selectedDate === key
          const outside = !isSameMonth(date, monthCursor)

          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              className={[
                'cal-day',
                inTrip ? 'cal-day--trip' : '',
                isSelected ? 'cal-day--selected' : '',
                outside ? 'cal-day--outside' : '',
                stopCount > 0 ? 'cal-day--filled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (inTrip) setSelectedDate(key)
              }}
              disabled={!inTrip}
              aria-pressed={isSelected}
              aria-label={`${format(date, 'EEEE, MMMM d')}${
                inTrip ? `, ${stopCount} stops` : ''
              }`}
            >
              <span className="cal-day__number">{format(date, 'd')}</span>
              {inTrip ? (
                <span className="cal-day__meta">
                  {stopCount > 0 ? `${stopCount} stop${stopCount === 1 ? '' : 's'}` : 'Open'}
                </span>
              ) : null}
              {stopCount > 0 ? (
                <span className="cal-day__dots" aria-hidden="true">
                  {Array.from({ length: Math.min(stopCount, 3) }).map((_, i) => (
                    <i key={i} />
                  ))}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="cal-selected">
        {selectedDay ? (
          <>
            <div className="cal-selected__summary">
              <h3>{formatDayHeading(selectedDay.date)}</h3>
              {selectedDay.activities.length === 0 ? (
                <p>No stops yet for this day.</p>
              ) : (
                <ul>
                  {selectedDay.activities.slice(0, 4).map((activity) => (
                    <li key={activity.id}>
                      <strong>{formatTimeDisplay(activity.time)}</strong>{' '}
                      {activity.title}
                    </li>
                  ))}
                  {selectedDay.activities.length > 4 ? (
                    <li>+{selectedDay.activities.length - 4} more</li>
                  ) : null}
                </ul>
              )}
            </div>
            <DaySection
              day={selectedDay}
              index={selectedIndex >= 0 ? selectedIndex : 0}
              onAdd={(input) => onAdd(selectedDay.id, input)}
              onUpdate={(activityId, input) =>
                onUpdate(selectedDay.id, activityId, input)
              }
              onDelete={(activityId) => onDelete(selectedDay.id, activityId)}
            />
          </>
        ) : (
          <p className="day__empty">Select a highlighted trip day to plan it.</p>
        )}
      </div>
    </section>
  )
}
