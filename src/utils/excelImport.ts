import { format, isValid, parse, parseISO } from 'date-fns'
import type { WorkBook } from 'xlsx'
import type { ActivityCategory, ActivityInput } from '../types'

export interface ImportedDay {
  date: string
  activities: ActivityInput[]
}

export interface SheetOption {
  name: string
  score: number
  recommended: boolean
  rowCount: number
}

export interface ExcelParseResult {
  fileName: string
  sheets: SheetOption[]
  defaultSelected: string[]
}

export interface ImportPreview {
  tripName: string
  destination: string
  startDate: string
  endDate: string
  days: ImportedDay[]
  warnings: string[]
  activityCount: number
  selectedSheets: string[]
}

const DATE_HEADERS = [
  'date',
  'day',
  'travel date',
  'trip date',
  'itinerary date',
  'when',
]
const TIME_HEADERS = [
  'time',
  'start',
  'start time',
  'begin',
  'arrival',
  'departure time',
]
const TITLE_HEADERS = [
  'title',
  'activity',
  'event',
  'item',
  'plan',
  'what',
  'reservation',
  'name',
  'stop',
  'description',
]
const LOCATION_HEADERS = [
  'location',
  'place',
  'where',
  'venue',
  'address',
  'hotel',
  'site',
]
const CITY_HEADERS = ['city', 'destination', 'town', 'area', 'region']
const NOTES_HEADERS = [
  'notes',
  'note',
  'details',
  'reservation details',
  'confirmation',
  'confirm #',
  'confirmation #',
  'confirmation number',
  'comments',
  'info',
  'remarks',
]
const CATEGORY_HEADERS = ['category', 'type', 'kind', 'segment']

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_/|]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function scoreSheetName(name: string): number {
  const lower = name.toLowerCase()
  let score = 0
  if (/day\s*by\s*day|itinerary|schedule|agenda|plan/.test(lower)) score += 8
  if (/^day\s*\d+/i.test(name) || /\bday\s*\d+\b/i.test(lower)) score += 6
  if (/reservation|lodging|hotel|flight|activity/.test(lower)) score += 3
  if (
    /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}[\/\-]\d{1,2}/i.test(
      lower,
    )
  ) {
    score += 4
  }
  if (/calendar|month view|overview|summary|cover|packing|budget/.test(lower)) {
    score -= 6
  }
  return score
}

function findHeaderIndex(headers: string[], aliases: string[]): number {
  for (let i = 0; i < headers.length; i += 1) {
    const header = headers[i]
    if (!header) continue
    if (aliases.some((alias) => header === alias || header.includes(alias))) {
      return i
    }
  }
  return -1
}

function excelSerialToDate(serial: number): Date | null {
  if (!Number.isFinite(serial) || serial < 20000 || serial > 80000) return null
  const utc = Date.UTC(1899, 11, 30) + serial * 86400000
  const date = new Date(utc)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseDateValue(value: unknown): string | null {
  if (value == null || value === '') return null

  if (value instanceof Date && isValid(value)) {
    return format(value, 'yyyy-MM-dd')
  }

  if (typeof value === 'number') {
    const fromSerial = excelSerialToDate(value)
    if (fromSerial) return format(fromSerial, 'yyyy-MM-dd')
  }

  const text = String(value).trim()
  if (!text) return null

  const iso = parseISO(text)
  if (isValid(iso) && /^\d{4}-\d{2}-\d{2}/.test(text)) {
    return format(iso, 'yyyy-MM-dd')
  }

  const patterns = [
    'MMMM d, yyyy',
    'MMM d, yyyy',
    'MMMM d yyyy',
    'MMM d yyyy',
    'M/d/yyyy',
    'MM/dd/yyyy',
    'M-d-yyyy',
    'yyyy/MM/dd',
    'd MMM yyyy',
    'EEEE, MMMM d, yyyy',
    'EEEE MMM d',
    'EEE MMM d',
  ]

  for (const pattern of patterns) {
    const parsed = parse(text, pattern, new Date())
    if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd')
  }

  const maybe = text.match(
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:,?\s*\d{4})?/i,
  )
  if (maybe) {
    const parsed = parse(maybe[0], 'MMM d, yyyy', new Date())
    if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd')
    const parsedNoYear = parse(maybe[0], 'MMM d', new Date())
    if (isValid(parsedNoYear)) return format(parsedNoYear, 'yyyy-MM-dd')
  }

  return null
}

function parseTimeValue(value: unknown): string {
  if (value == null || value === '') return ''

  if (value instanceof Date && isValid(value)) {
    return format(value, 'HH:mm')
  }

  if (typeof value === 'number' && value >= 0 && value < 1.5) {
    const totalMinutes = Math.round((value % 1) * 24 * 60)
    const hours = Math.floor(totalMinutes / 60) % 24
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const text = String(value).trim()
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!match) {
    const range = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (!range) return ''
    return normalizeParsedTime(range[1], range[2], range[3])
  }

  return normalizeParsedTime(match[1], match[2], match[3])
}

function normalizeParsedTime(
  hourText: string,
  minuteText: string | undefined,
  meridian: string | undefined,
): string {
  let hours = Number(hourText)
  const minutes = Number(minuteText ?? '0')
  const mer = meridian?.toLowerCase()
  if (mer === 'pm' && hours < 12) hours += 12
  if (mer === 'am' && hours === 12) hours = 0
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return ''
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function guessCategory(title: string, notes: string): ActivityCategory {
  const hay = `${title} ${notes}`.toLowerCase()
  if (/flight|airport|depart|arrive|boarding/.test(hay)) return 'flight'
  if (/hotel|check[- ]?in|check[- ]?out|lodging|airbnb|resort/.test(hay))
    return 'lodging'
  if (/dinner|lunch|breakfast|brunch|restaurant|cafe|food|eat/.test(hay))
    return 'food'
  if (/train|taxi|uber|transfer|ferry|bus|metro|rental car|drive/.test(hay))
    return 'transport'
  if (/note|reminder|confirm/.test(hay) && title.length < 18) return 'note'
  return 'activity'
}

function parseCategory(
  value: unknown,
  title: string,
  notes: string,
): ActivityCategory {
  const text = String(value ?? '').trim().toLowerCase()
  if (!text) return guessCategory(title, notes)
  if (text.includes('flight')) return 'flight'
  if (text.includes('lodg') || text.includes('hotel')) return 'lodging'
  if (text.includes('food') || text.includes('meal') || text.includes('dining'))
    return 'food'
  if (
    text.includes('transport') ||
    text.includes('transfer') ||
    text.includes('transit')
  ) {
    return 'transport'
  }
  if (text.includes('note')) return 'note'
  return 'activity'
}

function cellString(value: unknown): string {
  if (value == null) return ''
  if (value instanceof Date && isValid(value)) return format(value, 'MMM d, yyyy')
  return String(value).trim()
}

function dateFromSheetName(name: string): string | null {
  return parseDateValue(name)
}

function rowsFromSheet(
  XLSX: typeof import('xlsx'),
  workbook: WorkBook,
  sheetName: string,
): unknown[][] {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  })
}

function detectHeaderRow(rows: unknown[][]): number {
  const limit = Math.min(rows.length, 15)
  let bestIndex = 0
  let bestScore = -1

  for (let i = 0; i < limit; i += 1) {
    const headers = (rows[i] ?? []).map(normalizeHeader)
    let score = 0
    if (findHeaderIndex(headers, DATE_HEADERS) >= 0) score += 3
    if (findHeaderIndex(headers, TIME_HEADERS) >= 0) score += 2
    if (findHeaderIndex(headers, TITLE_HEADERS) >= 0) score += 3
    if (findHeaderIndex(headers, LOCATION_HEADERS) >= 0) score += 2
    if (findHeaderIndex(headers, CITY_HEADERS) >= 0) score += 2
    if (findHeaderIndex(headers, NOTES_HEADERS) >= 0) score += 2
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  return bestScore >= 3 ? bestIndex : 0
}

function extractActivitiesFromSheet(
  XLSX: typeof import('xlsx'),
  workbook: WorkBook,
  sheetName: string,
): { days: Map<string, ActivityInput[]>; warnings: string[] } {
  const warnings: string[] = []
  const days = new Map<string, ActivityInput[]>()
  const rows = rowsFromSheet(XLSX, workbook, sheetName)
  if (rows.length === 0) {
    warnings.push(`Sheet “${sheetName}” was empty.`)
    return { days, warnings }
  }

  const headerRowIndex = detectHeaderRow(rows)
  const headers = (rows[headerRowIndex] ?? []).map(normalizeHeader)
  const dateIdx = findHeaderIndex(headers, DATE_HEADERS)
  const timeIdx = findHeaderIndex(headers, TIME_HEADERS)
  const titleIdx = findHeaderIndex(headers, TITLE_HEADERS)
  const locationIdx = findHeaderIndex(headers, LOCATION_HEADERS)
  const cityIdx = findHeaderIndex(headers, CITY_HEADERS)
  const notesIdx = findHeaderIndex(headers, NOTES_HEADERS)
  const categoryIdx = findHeaderIndex(headers, CATEGORY_HEADERS)

  const sheetDate = dateFromSheetName(sheetName)
  let currentDate = sheetDate

  const hasUsefulHeaders =
    titleIdx >= 0 || dateIdx >= 0 || locationIdx >= 0 || notesIdx >= 0

  if (!hasUsefulHeaders) {
    for (let r = 0; r < rows.length; r += 1) {
      const row = rows[r] ?? []
      const values = row.map(cellString).filter(Boolean)
      if (values.length === 0) continue

      const maybeDate = parseDateValue(values[0])
      if (maybeDate && values.length === 1) {
        currentDate = maybeDate
        continue
      }

      const title = values[0]
      if (!title || /^(date|day|time|activity|itinerary)$/i.test(title)) continue
      const date = currentDate ?? sheetDate
      if (!date) continue

      const notes = values.slice(1).join(' · ')
      const activity: ActivityInput = {
        title,
        time: parseTimeValue(row[0]) && !maybeDate ? parseTimeValue(row[0]) : '',
        location: '',
        category: guessCategory(title, notes),
        notes,
      }
      const list = days.get(date) ?? []
      list.push(activity)
      days.set(date, list)
    }
    return { days, warnings }
  }

  for (let r = headerRowIndex + 1; r < rows.length; r += 1) {
    const row = rows[r] ?? []
    if (row.every((cell) => cellString(cell) === '')) continue

    const firstCellDate = parseDateValue(row[0])
    const nonEmpty = row.map(cellString).filter(Boolean)
    if (firstCellDate && nonEmpty.length <= 2 && titleIdx !== 0) {
      currentDate = firstCellDate
      const possibleTitle = titleIdx >= 0 ? cellString(row[titleIdx]) : ''
      if (!possibleTitle) continue
    }

    const rowDate =
      (dateIdx >= 0 ? parseDateValue(row[dateIdx]) : null) ??
      currentDate ??
      sheetDate

    const title =
      (titleIdx >= 0 ? cellString(row[titleIdx]) : '') ||
      (notesIdx >= 0 ? cellString(row[notesIdx]) : '') ||
      nonEmpty.find(
        (value) => !parseDateValue(value) && !parseTimeValue(value),
      ) ||
      ''

    if (!title) continue
    if (!rowDate) {
      warnings.push(`Skipped “${title}” on ${sheetName} — no date found.`)
      continue
    }

    const locationParts = [
      locationIdx >= 0 ? cellString(row[locationIdx]) : '',
      cityIdx >= 0 ? cellString(row[cityIdx]) : '',
    ].filter(Boolean)

    const notesParts = [
      notesIdx >= 0 ? cellString(row[notesIdx]) : '',
    ].filter(Boolean)

    headers.forEach((header, index) => {
      if (
        index === dateIdx ||
        index === timeIdx ||
        index === titleIdx ||
        index === locationIdx ||
        index === cityIdx ||
        index === notesIdx ||
        index === categoryIdx
      ) {
        return
      }
      const value = cellString(row[index])
      if (!value) return
      if (/confirm|reservation|ref|booking|confirmation/.test(header)) {
        notesParts.push(`${header}: ${value}`)
      }
    })

    const notes = [...new Set(notesParts)].join(' · ')
    const activity: ActivityInput = {
      title,
      time: timeIdx >= 0 ? parseTimeValue(row[timeIdx]) : '',
      location: locationParts.join(' · '),
      category: parseCategory(
        categoryIdx >= 0 ? row[categoryIdx] : '',
        title,
        notes,
      ),
      notes,
    }

    const list = days.get(rowDate) ?? []
    list.push(activity)
    days.set(rowDate, list)
    currentDate = rowDate
  }

  return { days, warnings }
}

export async function inspectExcelFile(file: File): Promise<{
  workbook: WorkBook
  meta: ExcelParseResult
}> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false,
  })

  const sheets: SheetOption[] = workbook.SheetNames.map((name) => {
    const rows = rowsFromSheet(XLSX, workbook, name)
    const score = scoreSheetName(name) + Math.min(3, Math.floor(rows.length / 20))
    return {
      name,
      score,
      recommended: score >= 3,
      rowCount: rows.filter((row) =>
        row.some((cell) => cellString(cell) !== ''),
      ).length,
    }
  }).sort((a, b) => b.score - a.score)

  const recommended = sheets
    .filter((sheet) => sheet.recommended)
    .map((sheet) => sheet.name)
  const defaultSelected =
    recommended.length > 0
      ? recommended
      : sheets.slice(0, Math.min(3, sheets.length)).map((sheet) => sheet.name)

  return {
    workbook,
    meta: {
      fileName: file.name,
      sheets,
      defaultSelected,
    },
  }
}

export async function buildImportPreview(
  workbook: WorkBook,
  selectedSheets: string[],
  fileName: string,
): Promise<ImportPreview> {
  const XLSX = await import('xlsx')

  const merged = new Map<string, ActivityInput[]>()
  const warnings: string[] = []
  const cities = new Map<string, number>()

  for (const sheetName of selectedSheets) {
    const { days, warnings: sheetWarnings } = extractActivitiesFromSheet(
      XLSX,
      workbook,
      sheetName,
    )
    warnings.push(...sheetWarnings)
    for (const [date, activities] of days) {
      const existing = merged.get(date) ?? []
      for (const activity of activities) {
        existing.push(activity)
        const cityGuess = activity.location.split('·').pop()?.trim()
        if (cityGuess && cityGuess.length < 40) {
          cities.set(cityGuess, (cities.get(cityGuess) ?? 0) + 1)
        }
      }
      merged.set(date, existing)
    }
  }

  const dates = [...merged.keys()].sort()
  const days: ImportedDay[] = dates.map((date) => ({
    date,
    activities: (merged.get(date) ?? []).sort((a, b) =>
      (a.time || '99:99').localeCompare(b.time || '99:99'),
    ),
  }))

  const activityCount = days.reduce(
    (sum, day) => sum + day.activities.length,
    0,
  )
  if (activityCount === 0) {
    warnings.push(
      'No itinerary rows were detected. Try another sheet, or check that dates/titles are present.',
    )
  }

  const topCity =
    [...cities.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

  const baseName = fileName.replace(/\.(xlsx|xls|csv)$/i, '').trim()

  return {
    tripName: baseName || 'Imported trip',
    destination: topCity,
    startDate: dates[0] ?? '',
    endDate: dates[dates.length - 1] ?? '',
    days,
    warnings,
    activityCount,
    selectedSheets,
  }
}
