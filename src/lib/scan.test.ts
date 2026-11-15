// @vitest-environment node
/**
 * End-to-end check: render the real code with bwip-js, then decode the PNG with a
 * QR reader and compare it against the payload a banking app would see.
 */
import bwipjs from 'bwip-js/node'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { describe, expect, it } from 'vitest'
import { SAMPLE_TEXT, defaultBarcode, type Format } from './barcode'
import { barcodeOptions, paymentOptions } from './options'
import { buildPayment, defaultPayment, type PaymentData } from './payment'
import type { RenderOptions } from './render'

/** Render with the exact options the app uses, then decode like a phone camera would. */
async function scanPayment(p: Partial<PaymentData>) {
  const result = buildPayment({ ...defaultPayment, ...p })
  const opts = paymentOptions(result)!
  const png = PNG.sync.read(await bwipjs.toBuffer({ ...opts, scale: 4 } as RenderOptions))
  return { payload: result.payload, decoded: jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data }
}

describe('scannable output', () => {
  it('EPC QR decodes back to the payload, including umlauts', async () => {
    const { payload, decoded } = await scanPayment({ name: 'Jürgen Müller GmbH', message: 'Größe Ä' })
    expect(decoded).toBe(payload)
  })
  it('Swiss QR-bill decodes back to the payload despite the Swiss cross', async () => {
    const { payload, decoded } = await scanPayment({
      country: 'CH',
      currency: 'CHF',
      iban: 'CH4431999123000889012',
      reference: '210000000003139471430009017',
      name: 'Café Zürich AG',
    })
    expect(decoded).toBe(payload)
  })
  it('generic QR decodes with custom colours', async () => {
    const opts = barcodeOptions({ ...defaultBarcode, format: 'qrcode', text: 'https://barmint.app/?ä=1', fg: '#114a3e', bg: '#effcf7' })
    const png = PNG.sync.read(await bwipjs.toBuffer(opts))
    expect(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data).toBe('https://barmint.app/?ä=1')
  })
  it('payment PNGs have an opaque white background', async () => {
    const opts = paymentOptions(buildPayment(defaultPayment))!
    const png = PNG.sync.read(await bwipjs.toBuffer(opts))
    expect([...png.data.subarray(0, 4)]).toEqual([255, 255, 255, 255])
  })
  it.each(['ean13', 'ean8', 'upca', 'code128'] as Format[])('%s sample renders', async (format) => {
    const buf = await bwipjs.toBuffer(barcodeOptions({ ...defaultBarcode, format, text: SAMPLE_TEXT[format] }))
    expect(PNG.sync.read(buf).width).toBeGreaterThan(50)
  })
  it('rejects a wrong EAN-13 check digit', async () => {
    await expect(
      bwipjs.toBuffer(barcodeOptions({ ...defaultBarcode, format: 'ean13', text: '4006381333932' })),
    ).rejects.toThrow(/check digit/i)
  })
})
