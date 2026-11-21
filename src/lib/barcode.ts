import type { Errors } from './payment'

export type Format = 'code128' | 'ean13' | 'ean8' | 'upca' | 'qrcode'

export const FORMATS: { id: Format; label: string; digits?: [number, number] }[] = [
  { id: 'code128', label: 'Code 128' },
  { id: 'ean13', label: 'EAN-13', digits: [12, 13] },
  { id: 'ean8', label: 'EAN-8', digits: [7, 8] },
  { id: 'upca', label: 'UPC-A', digits: [11, 12] },
  { id: 'qrcode', label: 'QR' },
]

/** Example content per format, shown as the input placeholder. */
export const SAMPLE_TEXT: Record<Format, string> = {
  code128: 'ABC-12345',
  ean13: '4006381333931',
  ean8: '9638507',
  upca: '03600029145',
  qrcode: 'https://example.com',
}

export interface BarcodeData {
  format: Format
  text: string
  fg: string
  bg: string
  scale: number
  showText: boolean
}

export const defaultBarcode: BarcodeData = {
  format: 'code128',
  text: '',
  fg: '#000000',
  bg: '#ffffff',
  scale: 4,
  showText: true,
}

export function validateBarcode(b: BarcodeData): Errors<BarcodeData> {
  const f = FORMATS.find((x) => x.id === b.format)!
  const text = b.text.trim()
  if (!text) return { text: { key: 'required' } }
  if (f.digits && (!/^\d+$/.test(text) || !f.digits.includes(text.length)))
    return { text: { key: 'digits', n: f.digits.join('/') } }
  return {}
}
