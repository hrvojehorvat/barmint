import { toSVG } from 'bwip-js/browser'
import { describe, expect, it } from 'vitest'
import { defaultBarcode, FORMATS, SAMPLE_TEXT } from './barcode'
import { barcodeOptions, paymentOptions } from './options'
import { buildPayment, defaultPayment } from './payment'
import { renderSVG } from './render'

// renderSVG uses the individual encoders (smaller bundle). It must produce exactly
// what the generic toSVG produced before, for every type the app can create.
describe('renderSVG with per-type encoders', () => {
  const cases = [
    ...FORMATS.map((f) => [f.label, barcodeOptions({ ...defaultBarcode, format: f.id, text: SAMPLE_TEXT[f.id] })] as const),
    ['EPC QR', paymentOptions(buildPayment(defaultPayment, 'Rechnung'))!] as const,
    [
      'Swiss QR-bill',
      paymentOptions(
        buildPayment({ ...defaultPayment, country: 'CH', currency: 'CHF', iban: 'CH93 0076 2011 6238 5295 7' }),
      )!,
    ] as const,
  ]

  it.each(cases)('%s matches the generic renderer', (_, opts) => {
    const svg = renderSVG(opts)
    expect(svg).toMatch(/^<svg /)
    expect(svg).toBe(toSVG({ ...opts }))
  })

  it.each(cases)('%s renders identically when called twice (options not mutated)', (_, opts) => {
    const before = JSON.stringify(opts)
    const first = renderSVG(opts)
    expect(renderSVG(opts)).toBe(first)
    expect(JSON.stringify(opts)).toBe(before)
  })

  it('rejects types the app does not bundle', () => {
    expect(() => renderSVG({ bcid: 'pdf417', text: 'x' })).toThrow(/Unsupported/)
  })
})
