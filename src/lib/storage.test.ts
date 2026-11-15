import { describe, expect, it } from 'vitest'
import { defaultState, loadHistory, pushHistory, readUrlState, saveHistory, writeUrlState, type AppState } from './storage'

const state: AppState = {
  ...defaultState,
  mode: 'barcode',
  payment: { ...defaultState.payment, name: 'Jürgen Müller · €' },
}

describe('URL state', () => {
  it('round-trips including non-ASCII text', () => {
    writeUrlState(state)
    expect(location.search).toMatch(/^\?s=[\w-]+$/)
    expect(readUrlState()).toEqual(state)
  })
  it('falls back to defaults on malformed links', () => {
    history.replaceState(null, '', '/?s=%%%garbage')
    expect(readUrlState()).toEqual(defaultState)
  })
  it('fills in fields missing from older links', () => {
    history.replaceState(null, '', `/?s=${btoa(JSON.stringify({ payment: { name: 'X' } }))}`)
    const s = readUrlState()
    expect(s.payment.name).toBe('X')
    expect(s.payment.iban).toBe(defaultState.payment.iban)
    expect(s.mode).toBe('payment')
  })
})

describe('history', () => {
  const item = (name: string) => ({
    label: name,
    thumb: 'data:,',
    state: { ...defaultState, payment: { ...defaultState.payment, name } },
  })

  it('puts newest first and de-duplicates identical states', () => {
    let h = pushHistory([], item('A'))
    h = pushHistory(h, item('B'))
    h = pushHistory(h, item('A'))
    expect(h.map((i) => i.label)).toEqual(['A', 'B'])
  })
  it('keeps at most 8 entries', () => {
    let h = pushHistory([], item('0'))
    for (let i = 1; i < 12; i++) h = pushHistory(h, item(String(i)))
    expect(h).toHaveLength(8)
    expect(h[0].label).toBe('11')
  })
  it('persists to localStorage', () => {
    const h = pushHistory([], item('A'))
    saveHistory(h)
    expect(loadHistory()).toEqual(h)
  })
  it('survives corrupted storage', () => {
    localStorage.setItem('barcode-history', '{nope')
    expect(loadHistory()).toEqual([])
  })
})
