import type { BarcodeData } from './barcode'
import type { PaymentResult } from './payment'
import type { RenderOptions } from './render'

/** Payment codes are always black on solid white so banking apps can scan them anywhere. */
export function paymentOptions(r: PaymentResult): RenderOptions | null {
  if (!r.payload) return null
  const base = { text: r.payload, scale: 8, padding: 4, backgroundcolor: 'FFFFFF' }
  return r.standard === 'swiss' ? { ...base, bcid: 'swissqrcode' } : { ...base, bcid: 'qrcode', eclevel: 'M' }
}

export function barcodeOptions(b: BarcodeData): RenderOptions {
  const qr = b.format === 'qrcode'
  return {
    bcid: b.format,
    text: b.text.trim(),
    scale: b.scale,
    barcolor: b.fg.slice(1),
    backgroundcolor: b.bg.slice(1),
    padding: qr ? 4 : 8,
    ...(qr ? { eclevel: 'M' } : { height: 18, includetext: b.showText, textxalign: 'center' as const }),
  }
}
