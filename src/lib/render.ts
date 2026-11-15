// Import only the encoders we use. bwip-js's toCanvas/toSVG look up the type by name in a
// table of all ~100 encoders, which keeps every one of them in the bundle.
import { code128, drawingSVG, ean13, ean8, qrcode, swissqrcode, upca, type toSVG } from 'bwip-js/browser'

export type RenderOptions = Parameters<typeof toSVG>[0] & { eclevel?: string }

const ENCODERS = { code128, ean13, ean8, upca, qrcode, swissqrcode }

function encoder(bcid: string) {
  const enc = ENCODERS[bcid as keyof typeof ENCODERS]
  if (!enc) throw new Error(`Unsupported barcode type: ${bcid}`)
  return enc
}

// bwip-js mutates the options it gets (padding is multiplied by scale in place), so a
// second render of the same object would double the padding. Always pass a copy.
export function renderCanvas(canvas: HTMLCanvasElement, opts: RenderOptions) {
  encoder(opts.bcid)(canvas, { ...opts })
}

export function renderSVG(opts: RenderOptions): string {
  return encoder(opts.bcid)({ ...opts }, drawingSVG())
}

function trigger(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

export function downloadPNG(canvas: HTMLCanvasElement, name: string) {
  trigger(canvas.toDataURL('image/png'), `${name}.png`)
}

export function downloadSVG(opts: RenderOptions, name: string) {
  const url = URL.createObjectURL(new Blob([renderSVG(opts)], { type: 'image/svg+xml' }))
  trigger(url, `${name}.svg`)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Error messages from BWIPP look like "bwipp.ean13badCheckDigit: Incorrect EAN-13 check digit". */
export const cleanError = (e: unknown) =>
  String(e instanceof Error ? e.message : e).replace(/^bwipp?\.\w+:\s*/, '')
