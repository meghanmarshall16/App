import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Trip } from '../types'
import { getSupabase, isCloudConfigured } from '../lib/supabase'
import { isTripArray } from './tripShare'

export const SPACE_STORAGE_KEY = 'trips-trips.space-id'

export type SyncStatus = 'local' | 'connecting' | 'synced' | 'offline' | 'error'

export interface TripSpace {
  id: string
  trips: Trip[]
  updatedAt: string
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function loadSavedSpaceId(): string | null {
  try {
    return localStorage.getItem(SPACE_STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveSpaceId(spaceId: string | null): void {
  try {
    if (spaceId) localStorage.setItem(SPACE_STORAGE_KEY, spaceId)
    else localStorage.removeItem(SPACE_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function normalizeSpaceCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function generateSpaceCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  let code = ''
  for (const byte of bytes) {
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length]
  }
  return code
}

function mapRow(row: {
  id: string
  trips: unknown
  updated_at: string
}): TripSpace {
  if (!isTripArray(row.trips)) {
    throw new Error('Cloud space data looks corrupted.')
  }
  return {
    id: row.id,
    trips: row.trips,
    updatedAt: row.updated_at,
  }
}

export async function fetchSpace(spaceId: string): Promise<TripSpace | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('trip_spaces')
    .select('id, trips, updated_at')
    .eq('id', spaceId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return mapRow(data)
}

export async function createSpace(trips: Trip[]): Promise<TripSpace> {
  if (!isCloudConfigured()) {
    throw new Error('Cloud sync is not set up yet.')
  }

  const supabase = getSupabase()
  let lastError: Error | null = null

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = generateSpaceCode()
    const { data, error } = await supabase
      .from('trip_spaces')
      .insert({ id, trips })
      .select('id, trips, updated_at')
      .single()

    if (!error && data) {
      saveSpaceId(data.id)
      return mapRow(data)
    }

    // Unique violation — try another code
    if (error?.code === '23505') {
      lastError = new Error(error.message)
      continue
    }

    throw new Error(error?.message ?? 'Could not create a cloud space.')
  }

  throw lastError ?? new Error('Could not create a cloud space.')
}

export async function joinSpace(rawCode: string): Promise<TripSpace> {
  const id = normalizeSpaceCode(rawCode)
  if (id.length < 4) {
    throw new Error('Enter the full space code from your partner.')
  }

  const space = await fetchSpace(id)
  if (!space) {
    throw new Error('No cloud space found for that code.')
  }

  saveSpaceId(space.id)
  return space
}

export async function pushSpace(
  spaceId: string,
  trips: Trip[],
): Promise<TripSpace> {
  const supabase = getSupabase()
  const updatedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from('trip_spaces')
    .update({ trips, updated_at: updatedAt })
    .eq('id', spaceId)
    .select('id, trips, updated_at')
    .single()

  if (error) throw new Error(error.message)
  return mapRow(data)
}

export function subscribeToSpace(
  spaceId: string,
  onChange: (space: TripSpace) => void,
  onError?: (message: string) => void,
): () => void {
  const supabase = getSupabase()
  const channel: RealtimeChannel = supabase
    .channel(`trip-space:${spaceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trip_spaces',
        filter: `id=eq.${spaceId}`,
      },
      (payload) => {
        const next = payload.new as
          | { id: string; trips: unknown; updated_at: string }
          | undefined
        if (!next) return
        try {
          onChange(mapRow(next))
        } catch (error) {
          onError?.(
            error instanceof Error ? error.message : 'Could not read cloud update.',
          )
        }
      },
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        onError?.('Lost the live cloud connection.')
      }
    })

  return () => {
    void supabase.removeChannel(channel)
  }
}
