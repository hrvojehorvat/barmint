import { defaultBarcode, FORMATS, type BarcodeData } from './barcode'
import { defaultPayment, type PaymentData } from './payment'

export type Mode = 'payment' | 'barcode'

export interface AppState {
  mode: Mode
  payment: PaymentData
  barcode: BarcodeData
}

export interface HistoryItem {
  id: string
  ts: number
  label: string
  thumb: string
  state: AppState
}

export const defaultState: AppState = { mode: 'payment', payment: defaultPayment, barcode: defaultBarcode }

const toB64 = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const fromB64 = (s: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)))

// Links and localStorage are untrusted input: anyone can craft a #s= link.
// Every value is checked against the type of its default; anything else falls back.
const MAX_LEN = 500
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v.slice(0, MAX_LEN) : fallback)
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback
const color = (v: unknown, fallback: string) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback)

function cleanPayment(v: unknown): PaymentData {
  const p = isObj(v) ? v : {}
  const out = { ...defaultPayment }
  for (const k of Object.keys(out) as (keyof PaymentData)[]) {
    if (k !== 'country' && k !== 'currency') out[k] = str(p[k], defaultPayment[k])
  }
  out.country = oneOf(p.country, ['DE', 'AT', 'CH'] as const, defaultPayment.country)
  out.currency = oneOf(p.currency, ['EUR', 'CHF'] as const, defaultPayment.currency)
  return out
}

function cleanBarcode(v: unknown): BarcodeData {
  const b = isObj(v) ? v : {}
  const scale = typeof b.scale === 'number' && Number.isFinite(b.scale) ? Math.round(b.scale) : defaultBarcode.scale
  return {
    format: oneOf(b.format, FORMATS.map((f) => f.id), defaultBarcode.format),
    text: str(b.text, defaultBarcode.text),
    fg: color(b.fg, defaultBarcode.fg),
    bg: color(b.bg, defaultBarcode.bg),
    scale: Math.min(10, Math.max(1, scale)),
    showText: typeof b.showText === 'boolean' ? b.showText : defaultBarcode.showText,
  }
}

/** Turn a possibly partial, outdated or tampered saved state into a valid one. */
export function hydrate(v: unknown): AppState {
  const s = isObj(v) ? v : {}
  return {
    mode: s.mode === 'barcode' ? 'barcode' : 'payment',
    payment: cleanPayment(s.payment),
    barcode: cleanBarcode(s.barcode),
  }
}

/**
 * State lives in the URL fragment (#s=…). Browsers never send the fragment to the
 * server, so names and IBANs don't end up in hosting access logs.
 * Older links used the query string (?s=…); those are still read and then migrated.
 */
export function readUrlState(): AppState {
  try {
    const s =
      new URLSearchParams(location.hash.slice(1)).get('s') ?? new URLSearchParams(location.search).get('s')
    if (s) return hydrate(JSON.parse(fromB64(s)))
  } catch {
    /* ignore malformed links */
  }
  return defaultState
}

export function writeUrlState(state: AppState) {
  // Rebuilding from pathname also drops a legacy ?s= query.
  history.replaceState(null, '', `${location.pathname}#s=${toB64(JSON.stringify(state))}`)
}

const HISTORY_KEY = 'barcode-history'
const MAX_HISTORY = 8

export function loadHistory(): HistoryItem[] {
  try {
    const items: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    if (!Array.isArray(items)) return []
    return items
      .filter(isObj)
      .slice(0, MAX_HISTORY)
      .map((i) => ({
        id: str(i.id, String(Math.random())),
        ts: typeof i.ts === 'number' ? i.ts : 0,
        label: str(i.label, ''),
        // Only our own PNG thumbnails, never arbitrary URLs.
        thumb: typeof i.thumb === 'string' && i.thumb.startsWith('data:image/png;base64,') ? i.thumb : '',
        state: hydrate(i.state),
      }))
  } catch {
    return []
  }
}

export function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)))
  } catch {
    /* quota or private mode */
  }
}

export function pushHistory(items: HistoryItem[], item: Omit<HistoryItem, 'id' | 'ts'>): HistoryItem[] {
  const key = JSON.stringify(item.state)
  const rest = items.filter((i) => JSON.stringify(i.state) !== key)
  // crypto.randomUUID only exists on HTTPS/localhost, not on http://<lan-ip> when testing on a phone.
  const id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return [{ ...item, id, ts: Date.now() }, ...rest].slice(0, MAX_HISTORY)
}
