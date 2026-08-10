import type { Trip } from '../types'

const SHARE_VERSION = 1 as const

export interface SharePayload {
  v: typeof SHARE_VERSION
  trips: Trip[]
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToBytes(token: string): Uint8Array {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (padded.length % 4)) % 4
  const base64 = padded + '='.repeat(padLength)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function gzipEncode(text: string): Promise<Uint8Array> {
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream('gzip'))
  const buffer = await new Response(stream).arrayBuffer()
  return new Uint8Array(buffer)
}

async function gzipDecode(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const stream = new Blob([copy.buffer])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).text()
}

function normalizeImportedTrip(raw: Trip): Trip {
  return {
    ...raw,
    id: String(raw.id ?? crypto.randomUUID()),
    name: String(raw.name ?? '').trim() || 'Untitled trip',
    destination: String(raw.destination ?? '').trim() || 'Somewhere',
    startDate: String(raw.startDate ?? ''),
    endDate: String(raw.endDate ?? ''),
    coverTone: (['sky', 'cloud', 'ink', 'mist'] as const).includes(raw.coverTone)
      ? raw.coverTone
      : 'sky',
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    days: Array.isArray(raw.days) ? raw.days : [],
    packingList: Array.isArray(raw.packingList) ? raw.packingList : [],
  }
}

export function isTripArray(value: unknown): value is Trip[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof (item as Trip).id === 'string' &&
        typeof (item as Trip).name === 'string',
    )
  )
}

export async function encodeShareToken(trips: Trip[]): Promise<string> {
  const payload: SharePayload = { v: SHARE_VERSION, trips }
  const compressed = await gzipEncode(JSON.stringify(payload))
  return bytesToBase64Url(compressed)
}

export async function decodeShareToken(token: string): Promise<Trip[]> {
  const trimmed = token.trim()
  if (!trimmed) {
    throw new Error('Nothing to import.')
  }

  try {
    const bytes = base64UrlToBytes(trimmed)
    const json = await gzipDecode(bytes)
    const parsed = JSON.parse(json) as SharePayload
    if (parsed?.v !== SHARE_VERSION || !isTripArray(parsed.trips)) {
      throw new Error('Unrecognized share data.')
    }
    return parsed.trips.map(normalizeImportedTrip)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unrecognized share data.') {
      throw error
    }
    throw new Error('That share link or code could not be read.')
  }
}

export function parseExportFile(text: string): Trip[] {
  const parsed = JSON.parse(text) as SharePayload | Trip[]
  if (isTripArray(parsed)) {
    return parsed.map(normalizeImportedTrip)
  }
  if (
    parsed &&
    typeof parsed === 'object' &&
    'trips' in parsed &&
    isTripArray((parsed as SharePayload).trips)
  ) {
    return (parsed as SharePayload).trips.map(normalizeImportedTrip)
  }
  throw new Error('That file does not look like a Trip’s Trips export.')
}

export function buildExportFile(trips: Trip[]): string {
  const payload: SharePayload = { v: SHARE_VERSION, trips }
  return `${JSON.stringify(payload, null, 2)}\n`
}

export function buildShareUrl(token: string): string {
  const url = new URL('/import', window.location.origin)
  url.hash = token
  return url.toString()
}

export function mergeTrips(existing: Trip[], incoming: Trip[]): Trip[] {
  const incomingIds = new Set(incoming.map((trip) => trip.id))
  const leftovers = existing.filter((trip) => !incomingIds.has(trip.id))
  return [...incoming, ...leftovers]
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.left = '-9999px'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }
}

export function downloadTripsFile(trips: Trip[], filename = 'trips-trips.json'): void {
  const blob = new Blob([buildExportFile(trips)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
