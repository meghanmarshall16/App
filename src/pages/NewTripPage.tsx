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
          <p className="eyebrow">New adventure</p>
          <h1>Plan a trip</h1>
          <p className="page-lede">
            Name the place, set the dates, and we&apos;ll build days, packing
            suggestions, and destination ideas.
          </p>
        </header>
        <TripForm
          submitLabel="Create trip"
          onCancel={() => navigate('/trips')}
          onSubmit={(input) => {
            const trip = onCreate(input)
            navigate(`/trips/${trip.id}?tab=calendar`)
          }}
        />
      </div>
    </AppShell>
  )
}
