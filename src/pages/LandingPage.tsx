import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DogsPhoto } from '../components/DogsPhoto'
import { PawIcon, PlaneIcon } from '../components/Icons'
import { useDogPhoto } from '../hooks/useDogPhoto'

export function LandingPage() {
  const { photo, saveFromFile, clear, isCustom, saving, error } = useDogPhoto()

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
          <h1 className="hero__headline">Personal travel, planned your way.</h1>
          <p className="hero__lede">
            Day-by-day itineraries and packing lists for trips off the clock —
            with the dogs along for the branding.
          </p>
          <div className="hero__actions">
            <Link to="/trips" className="btn btn--primary btn--large">
              Open my trips
            </Link>
            <Link to="/trips/new" className="btn btn--ghost btn--large">
              Plan a new trip
            </Link>
          </div>
        </div>
      </section>

      <section className="dogs-band">
        <div className="dogs-band__inner">
          <DogsPhoto
            photo={photo}
            onSelect={(file) => {
              void saveFromFile(file)
            }}
            onClear={clear}
            isCustom={isCustom}
            saving={saving}
            error={error}
          />
        </div>
      </section>
    </AppShell>
  )
}
