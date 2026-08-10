import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useTrips } from './hooks/useTrips'
import { ImportTripsPage } from './pages/ImportTripsPage'
import { LandingPage } from './pages/LandingPage'
import { NewTripPage } from './pages/NewTripPage'
import { TripDetailPage } from './pages/TripDetailPage'
import { TripsPage } from './pages/TripsPage'
import './App.css'

export default function App() {
  const {
    trips,
    spaceId,
    syncStatus,
    syncError,
    cloudReady,
    startCloudSpace,
    connectCloudSpace,
    disconnectCloudSpace,
    addTrip,
    editTrip,
    deleteTrip,
    createActivity,
    editActivity,
    deleteActivity,
    createPackingItem,
    flipPackingItem,
    deletePackingItem,
    syncPackingSuggestions,
    getTrip,
    importIncomingTrips,
  } = useTrips()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/trips"
          element={
            <TripsPage
              trips={trips}
              onDelete={deleteTrip}
              onImport={importIncomingTrips}
              cloudReady={cloudReady}
              spaceId={spaceId}
              syncStatus={syncStatus}
              syncError={syncError}
              onStartCloud={startCloudSpace}
              onJoinCloud={connectCloudSpace}
              onDisconnectCloud={disconnectCloudSpace}
            />
          }
        />
        <Route path="/trips/new" element={<NewTripPage onCreate={addTrip} />} />
        <Route
          path="/import"
          element={<ImportTripsPage onImport={importIncomingTrips} />}
        />
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
              onAddPackingItem={createPackingItem}
              onTogglePackingItem={flipPackingItem}
              onRemovePackingItem={deletePackingItem}
              onRefreshPacking={syncPackingSuggestions}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
