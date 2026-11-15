import { defaultBarcode, type BarcodeData } from './barcode'
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

/** Merge a possibly partial / outdated saved state onto the defaults. */
const hydrate = (s: Partial<AppState>): AppState => ({
  mode: s.mode === 'barcode' ? 'barcode' : 'payment',
  payment: { ...defaultPayment, ...s.payment },
  barcode: { ...defaultBarcode, ...s.barcode },
})

export function readUrlState(): AppState {
  try {
    const s = new URLSearchParams(location.search).get('s')
    if (s) return hydrate(JSON.parse(fromB64(s)))
  } catch {
    /* ignore malformed links */
  }
  return defaultState
}

export function writeUrlState(state: AppState) {
  const url = `${location.pathname}?s=${toB64(JSON.stringify(state))}`
  history.replaceState(null, '', url)
}

const HISTORY_KEY = 'barcode-history'
const MAX_HISTORY = 8

export function loadHistory(): HistoryItem[] {
  try {
    const items = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as HistoryItem[]
    return items.map((i) => ({ ...i, state: hydrate(i.state) }))
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
