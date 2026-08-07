import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useTrips } from './hooks/useTrips'
import { LandingPage } from './pages/LandingPage'
import { NewTripPage } from './pages/NewTripPage'
import { TripDetailPage } from './pages/TripDetailPage'
import { TripsPage } from './pages/TripsPage'
import './App.css'

export default function App() {
  const {
    trips,
    addTrip,
    editTrip,
    deleteTrip,
    createActivity,
    editActivity,
    deleteActivity,
    getTrip,
  } = useTrips()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/trips"
          element={<TripsPage trips={trips} onDelete={deleteTrip} />}
        />
        <Route path="/trips/new" element={<NewTripPage onCreate={addTrip} />} />
        <Route
          path="/trips/:tripId"
          element={
            <TripDetailPage
              getTrip={getTrip}
              onEdit={editTrip}
              onDelete={deleteTrip}
              onAddActivity={createActivity}
              onEditActivity={editActivity}
              onDeleteActivity={deleteActivity}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
