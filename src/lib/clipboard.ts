/** Image copy needs the async Clipboard API, which only exists on HTTPS (and localhost). */
export const canCopyImage = () => typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write

/**
 * Copies a canvas as PNG. The blob is handed over as a promise so that clipboard.write
 * runs synchronously inside the click; Safari rejects it after an `await`.
 */
export async function copyImage(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'),
    )
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch {
    return false
  }
}

/** Copies text; falls back to execCommand where the Clipboard API is missing (plain HTTP). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      ta.remove()
    }
  }
}
