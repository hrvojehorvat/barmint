import { toCanvas, toSVG } from 'bwip-js/browser'

export type RenderOptions = Parameters<typeof toSVG>[0] & { eclevel?: string }

export function renderCanvas(canvas: HTMLCanvasElement, opts: RenderOptions) {
  toCanvas(canvas, opts)
}

export function renderSVG(opts: RenderOptions): string {
  return toSVG(opts)
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

export async function copyPNG(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'),
  )
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

/** Error messages from BWIPP look like "bwipp.ean13badCheckDigit: Incorrect EAN-13 check digit". */
export const cleanError = (e: unknown) =>
  String(e instanceof Error ? e.message : e).replace(/^bwipp?\.\w+:\s*/, '')
