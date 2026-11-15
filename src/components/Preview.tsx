import { Check, Copy, Download, FileCode2, ScanLine } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Dict } from '../i18n'
import { cleanError, copyPNG, downloadPNG, downloadSVG, renderCanvas, type RenderOptions } from '../lib/render'
import { Button, Card } from './ui'

interface Props {
  opts: RenderOptions | null
  filename: string
  caption?: string
  onExport: (thumb: string) => void
  t: Dict
}

export function Preview({ opts, filename, caption, onExport, t }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!opts || !canvas.current) return
    try {
      renderCanvas(canvas.current, opts)
      setError(null)
    } catch (e) {
      setError(cleanError(e))
    }
  }, [opts])

  const ready = !!opts && !error
  // Save a small thumbnail for the history list.
  const exported = () => {
    const src = canvas.current
    if (!src) return
    const k = Math.min(1, 96 / Math.max(src.width, src.height))
    const thumb = document.createElement('canvas')
    thumb.width = Math.round(src.width * k)
    thumb.height = Math.round(src.height * k)
    thumb.getContext('2d')!.drawImage(src, 0, 0, thumb.width, thumb.height)
    onExport(thumb.toDataURL('image/png'))
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{t.preview}</h2>
        {caption && <span className="text-xs text-neutral-400">{caption}</span>}
      </div>

      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 p-6">
        <canvas
          ref={canvas}
          className={ready ? 'opacity-100 transition-opacity duration-300' : 'opacity-0'}
          style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', imageRendering: 'pixelated' }}
        />
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <ScanLine className="h-10 w-10 text-neutral-300" strokeWidth={1.5} />
            <p className="text-sm text-neutral-400 max-w-[220px]">
              {error ? `${t.renderError}: ${error}` : t.empty}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Button
          variant="primary"
          disabled={!ready}
          onClick={() => {
            downloadPNG(canvas.current!, filename)
            exported()
          }}
        >
          <Download className="h-4 w-4" /> {t.png}
        </Button>
        <Button
          disabled={!ready}
          onClick={() => {
            downloadSVG(opts!, filename)
            exported()
          }}
        >
          <FileCode2 className="h-4 w-4" /> {t.svg}
        </Button>
        <Button
          disabled={!ready}
          onClick={async () => {
            await copyPNG(canvas.current!)
            exported()
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? <Check className="h-4 w-4 text-mint-500" /> : <Copy className="h-4 w-4" />}
          {copied ? t.copied : t.copy}
        </Button>
      </div>
    </Card>
  )
}
