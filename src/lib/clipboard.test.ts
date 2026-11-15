import { afterEach, describe, expect, it, vi } from 'vitest'
import { canCopyImage, copyImage, copyText } from './clipboard'

const setClipboard = (c: unknown) => Object.defineProperty(navigator, 'clipboard', { value: c, configurable: true })

afterEach(() => {
  vi.unstubAllGlobals()
  setClipboard(undefined)
  vi.restoreAllMocks()
})

describe('copyText', () => {
  it('uses the Clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })
    expect(await copyText('hi')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hi')
  })
  it('falls back to execCommand on plain HTTP (no navigator.clipboard)', async () => {
    setClipboard(undefined)
    const exec = vi.fn().mockReturnValue(true)
    document.execCommand = exec
    expect(await copyText('hi')).toBe(true)
    expect(exec).toHaveBeenCalledWith('copy')
    expect(document.querySelector('textarea')).toBeNull()
  })
  it('reports failure when permission is denied and the fallback fails', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) })
    document.execCommand = vi.fn().mockReturnValue(false)
    expect(await copyText('hi')).toBe(false)
  })
})

describe('copyImage', () => {
  const canvas = () => {
    const c = document.createElement('canvas')
    c.toBlob = (cb) => cb(new Blob(['png'], { type: 'image/png' }))
    return c
  }
  class FakeItem {
    constructor(public items: Record<string, Promise<Blob>>) {}
  }

  it('is unavailable without ClipboardItem', () => {
    setClipboard({ write: vi.fn() })
    expect(canCopyImage()).toBe(false)
  })
  it('writes synchronously with a blob promise (Safari)', async () => {
    vi.stubGlobal('ClipboardItem', FakeItem)
    const write = vi.fn().mockResolvedValue(undefined)
    setClipboard({ write })
    expect(canCopyImage()).toBe(true)
    const done = copyImage(canvas())
    expect(write).toHaveBeenCalledTimes(1) // called before any await
    const item = write.mock.calls[0][0][0] as FakeItem
    expect(item.items['image/png']).toBeInstanceOf(Promise)
    expect(await done).toBe(true)
  })
  it('returns false instead of throwing when denied', async () => {
    vi.stubGlobal('ClipboardItem', FakeItem)
    setClipboard({ write: vi.fn().mockRejectedValue(new Error('NotAllowedError')) })
    expect(await copyImage(canvas())).toBe(false)
  })
})
