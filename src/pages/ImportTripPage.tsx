import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { WorkBook } from 'xlsx'
import { AppShell } from '../components/AppShell'
import { PawIcon } from '../components/Icons'
import type { ActivityInput, Trip } from '../types'
import {
  buildImportPreview,
  inspectExcelFile,
  type ImportPreview,
  type SheetOption,
} from '../utils/excelImport'
import { formatDayHeading } from '../utils/dates'

interface ImportTripPageProps {
  onImport: (input: {
    name: string
    destination: string
    startDate: string
    endDate: string
    days: { date: string; activities: ActivityInput[] }[]
  }) => Trip
}

export function ImportTripPage({ onImport }: ImportTripPageProps) {
  const navigate = useNavigate()
  const [workbook, setWorkbook] = useState<WorkBook | null>(null)
  const [fileName, setFileName] = useState('')
  const [sheets, setSheets] = useState<SheetOption[]>([])
  const [selectedSheets, setSelectedSheets] = useState<string[]>([])
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [tripName, setTripName] = useState('')
  const [destination, setDestination] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const selectedCount = selectedSheets.length
  const previewSummary = useMemo(() => {
    if (!preview) return ''
    return `${preview.days.length} days · ${preview.activityCount} stops`
  }, [preview])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    setPreview(null)
    try {
      const { workbook: book, meta } = await inspectExcelFile(file)
      setWorkbook(book)
      setFileName(meta.fileName)
      setSheets(meta.sheets)
      setSelectedSheets(meta.defaultSelected)
      const nextPreview = await buildImportPreview(
        book,
        meta.defaultSelected,
        meta.fileName,
      )
      setPreview(nextPreview)
      setTripName(nextPreview.tripName)
      setDestination(nextPreview.destination)
    } catch {
      setError('Could not read that Excel file. Try an .xlsx export.')
      setWorkbook(null)
      setSheets([])
      setSelectedSheets([])
    } finally {
      setBusy(false)
    }
  }

  function toggleSheet(name: string) {
    if (!workbook) return
    const next = selectedSheets.includes(name)
      ? selectedSheets.filter((sheet) => sheet !== name)
      : [...selectedSheets, name]
    setSelectedSheets(next)
    if (next.length === 0) {
      setPreview(null)
      return
    }
    setBusy(true)
    void buildImportPreview(workbook, next, fileName)
      .then((nextPreview) => {
        setPreview(nextPreview)
        if (!tripName) setTripName(nextPreview.tripName)
        if (!destination) setDestination(nextPreview.destination)
      })
      .finally(() => setBusy(false))
  }

  function handleImport() {
    if (!preview || !preview.startDate || !preview.endDate) {
      setError('Select at least one sheet that contains dated itinerary rows.')
      return
    }
    if (preview.activityCount === 0) {
      setError('No stops found in the selected sheets.')
      return
    }

    const trip = onImport({
      name: tripName.trim() || preview.tripName,
      destination: destination.trim() || preview.destination || 'Imported trip',
      startDate: preview.startDate,
      endDate: preview.endDate,
      days: preview.days,
    })
    navigate(`/trips/${trip.id}`)
  }

  return (
    <AppShell>
      <div className="page page--narrow page--import">
        <header className="page-header page-header--stack">
          <p className="eyebrow">
            <PawIcon className="inline-paw" /> Excel import
          </p>
          <h1>Import a trip</h1>
          <p className="page-lede">
            Upload your itinerary workbook. We&apos;ll prefer day-by-day sheets
            over calendar views, then build stops from reservation details,
            cities, and notes.
          </p>
        </header>

        <label className="import-drop">
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={(event) => {
              void handleFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <span className="import-drop__title">
            {busy ? 'Reading workbook…' : 'Choose Excel file'}
          </span>
          <span className="import-drop__hint">
            .xlsx works best · multiple sheets supported
          </span>
        </label>

        {fileName ? (
          <p className="import-filename">Loaded: {fileName}</p>
        ) : null}

        {sheets.length > 0 ? (
          <section className="import-sheets">
            <h2>Sheets to import</h2>
            <p className="page-lede">
              Calendar sheets are unchecked by default. Keep day-by-day /
              itinerary sheets selected.
            </p>
            <ul className="import-sheet-list">
              {sheets.map((sheet) => (
                <li key={sheet.name}>
                  <label className="import-sheet">
                    <input
                      type="checkbox"
                      checked={selectedSheets.includes(sheet.name)}
                      onChange={() => toggleSheet(sheet.name)}
                    />
                    <span>
                      <strong>{sheet.name}</strong>
                      <small>
                        {sheet.rowCount} rows
                        {sheet.recommended ? ' · recommended' : ''}
                      </small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {preview ? (
          <section className="import-preview">
            <h2>Preview</h2>
            <p className="import-preview__summary">{previewSummary}</p>

            <div className="panel-form">
              <label className="field">
                <span>Trip name</span>
                <input
                  type="text"
                  value={tripName}
                  onChange={(event) => setTripName(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Destination</span>
                <input
                  type="text"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="City or region"
                />
              </label>
            </div>

            {preview.warnings.length > 0 ? (
              <ul className="import-warnings">
                {preview.warnings.slice(0, 6).map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}

            <div className="import-day-preview">
              {preview.days.slice(0, 4).map((day) => (
                <div key={day.date} className="import-day">
                  <h3>{formatDayHeading(day.date)}</h3>
                  <ul>
                    {day.activities.slice(0, 4).map((activity, index) => (
                      <li key={`${day.date}-${index}`}>
                        {activity.time ? <strong>{activity.time}</strong> : null}{' '}
                        {activity.title}
                        {activity.location ? (
                          <span> · {activity.location}</span>
                        ) : null}
                      </li>
                    ))}
                    {day.activities.length > 4 ? (
                      <li>+{day.activities.length - 4} more</li>
                    ) : null}
                  </ul>
                </div>
              ))}
              {preview.days.length > 4 ? (
                <p className="page-lede">
                  +{preview.days.length - 4} more days will import too.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions import-actions">
          <Link to="/trips/new" className="btn btn--ghost">
            Back
          </Link>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!preview || preview.activityCount === 0 || selectedCount === 0}
            onClick={handleImport}
          >
            Import trip
          </button>
        </div>
      </div>
    </AppShell>
  )
}
