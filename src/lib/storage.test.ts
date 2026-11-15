import { describe, expect, it } from 'vitest'
import { defaultState, hydrate, loadHistory, pushHistory, readUrlState, saveHistory, writeUrlState, type AppState } from './storage'

const state: AppState = {
  ...defaultState,
  mode: 'barcode',
  payment: { ...defaultState.payment, name: 'Jürgen Müller · €' },
}

describe('URL state', () => {
  it('round-trips including non-ASCII text', () => {
    writeUrlState(state)
    expect(location.hash).toMatch(/^#s=[\w-]+$/)
    expect(readUrlState()).toEqual(state)
  })
  it('keeps data out of the query string, which is sent to the server', () => {
    writeUrlState(state)
    expect(location.search).toBe('')
    expect(location.href).not.toContain('?')
  })
  it('still reads old ?s= links and migrates them to #s=', () => {
    writeUrlState(state)
    const legacy = location.hash.replace('#', '?')
    history.replaceState(null, '', `/${legacy}`)
    expect(readUrlState()).toEqual(state)
    writeUrlState(readUrlState())
    expect(location.search).toBe('')
    expect(location.hash).toMatch(/^#s=/)
  })
  it('falls back to defaults on malformed links', () => {
    history.replaceState(null, '', '/#s=%%%garbage')
    expect(readUrlState()).toEqual(defaultState)
  })
  it('fills in fields missing from older links', () => {
    history.replaceState(null, '', `/#s=${btoa(JSON.stringify({ payment: { name: 'X' } }))}`)
    const s = readUrlState()
    expect(s.payment.name).toBe('X')
    expect(s.payment.iban).toBe(defaultState.payment.iban)
    expect(s.mode).toBe('payment')
  })
})

describe('history', () => {
  const item = (name: string) => ({
    label: name,
    thumb: 'data:image/png;base64,AAAA',
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

describe('tampered input', () => {
  const link = (v: unknown) => history.replaceState(null, '', `/#s=${btoa(JSON.stringify(v))}`)

  it('replaces wrong types with defaults instead of crashing', () => {
    link({
      mode: 'evil',
      payment: { name: 42, iban: { x: 1 }, country: 'FR', currency: 'USD', message: ['a'] },
      barcode: { format: 'pdf417', text: null, fg: 'red;}', bg: 'javascript:1', scale: '1e9', showText: 'yes' },
    })
    expect(readUrlState()).toEqual(defaultState)
  })
  it('clamps the scale and keeps valid values', () => {
    const s = hydrate({ barcode: { format: 'ean13', scale: -5, fg: '#12ABef' } })
    expect(s.barcode).toMatchObject({ format: 'ean13', scale: 1, fg: '#12ABef' })
    expect(hydrate({ barcode: { scale: 99 } }).barcode.scale).toBe(10)
    expect(hydrate({ barcode: { scale: NaN } }).barcode.scale).toBe(defaultState.barcode.scale)
  })
  it('handles non-object JSON', () => {
    for (const v of [null, 1, 'x', [1, 2], true]) expect(hydrate(v)).toEqual(defaultState)
  })
  it('caps very long strings', () => {
    expect(hydrate({ payment: { name: 'a'.repeat(100_000) } }).payment.name).toHaveLength(500)
  })
  it('ignores unknown keys', () => {
    const s = hydrate({ payment: { __proto__: { x: 1 }, evil: 'x' } }) as unknown as { payment: Record<string, unknown> }
    expect(s.payment.evil).toBeUndefined()
  })
  it('sanitises history from localStorage', () => {
    localStorage.setItem(
      'barcode-history',
      JSON.stringify([
        { id: 'a', ts: 1, label: 'ok', thumb: 'data:image/png;base64,AAAA', state: { mode: 'barcode' } },
        { id: 'b', ts: 'x', label: 5, thumb: 'javascript:alert(1)', state: 'nope' },
        null,
        'str',
      ]),
    )
    const items = loadHistory()
    expect(items).toHaveLength(2)
    expect(items[0].thumb).toBe('data:image/png;base64,AAAA')
    expect(items[0].state.mode).toBe('barcode')
    expect(items[1]).toMatchObject({ ts: 0, label: '', thumb: '', state: defaultState })
  })
  it('returns empty history when storage holds a non-array', () => {
    localStorage.setItem('barcode-history', '{"a":1}')
    expect(loadHistory()).toEqual([])
  })
})
