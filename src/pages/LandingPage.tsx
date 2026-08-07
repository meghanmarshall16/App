import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { PawIcon, PlaneIcon } from '../components/Icons'

export function LandingPage() {
  return (
    <AppShell transparent>
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <div className="hero__sky" />
          <div className="hero__paws">
            <PawIcon className="hero-paw hero-paw--1" />
            <PawIcon className="hero-paw hero-paw--2" />
            <PawIcon className="hero-paw hero-paw--3" />
            <PawIcon className="hero-paw hero-paw--4" />
            <PawIcon className="hero-paw hero-paw--5" />
            <PlaneIcon className="hero-plane" />
          </div>
        </div>
        <div className="hero__content">
          <p className="hero__brand">
            Trip&apos;s Trips
            <PawIcon className="hero__brand-paw" />
          </p>
          <h1 className="hero__headline">Flight plan for every layover.</h1>
          <p className="hero__lede">
            Built for a pilot&apos;s calendar — day-by-day itineraries, packing
            lists, and destination briefings before you land. Paw prints
            welcome aboard.
          </p>
          <div className="hero__actions">
            <Link to="/trips" className="btn btn--primary btn--large">
              Open my trips
            </Link>
            <Link to="/trips/new" className="btn btn--ghost btn--large">
              File a new trip
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
