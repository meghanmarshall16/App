import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { TripForm } from '../components/TripForm'
import type { Trip, TripInput } from '../types'

interface NewTripPageProps {
  onCreate: (input: TripInput) => Trip
}

export function NewTripPage({ onCreate }: NewTripPageProps) {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="page page--narrow">
        <header className="page-header page-header--stack">
          <p className="eyebrow">New journey</p>
          <h1>Plan a trip</h1>
          <p className="page-lede">
            Name the place, set the dates, and Waymark lays out each day for you.
          </p>
        </header>
        <TripForm
          submitLabel="Create trip"
          onCancel={() => navigate('/trips')}
          onSubmit={(input) => {
            const trip = onCreate(input)
            navigate(`/trips/${trip.id}`)
          }}
        />
      </div>
    </AppShell>
  )
}
