import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core'
import { LucideCheck, LucideCopy, LucideDownload, LucideFileCode2, LucideInfo, LucideScanLine, LucideX } from '@lucide/angular'
import type { Dict } from '../../../i18n'
import { canCopyImage, copyImage } from '../../../lib/clipboard'
import { cleanError, downloadPNG, downloadSVG, type RenderOptions } from '../../../lib/render'
import { CANVAS_RENDERER } from '../canvas-renderer'
import { Button } from '../../ui/button'
import { Card } from '../../ui/card'

@Component({
  selector: 'app-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Button, LucideCheck, LucideCopy, LucideDownload, LucideFileCode2, LucideInfo, LucideScanLine, LucideX],
  templateUrl: './preview.html',
  host: { class: 'block' },
})
export class Preview {
  readonly opts = input.required<RenderOptions | null>()
  readonly filename = input.required<string>()
  readonly caption = input<string>()
  readonly note = input<string>()
  readonly t = input.required<Dict>()
  readonly exported = output<string>()

  private readonly render = inject(CANVAS_RENDERER)
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas')
  protected readonly error = signal<string | null>(null)
  protected readonly copied = signal<'ok' | 'fail' | null>(null)
  protected readonly canCopy = canCopyImage()
  protected readonly ready = computed(() => !!this.opts() && !this.error())
  private timer?: ReturnType<typeof setTimeout>

  constructor() {
    // Redraw after the view updated whenever the options change.
    afterRenderEffect({
      write: () => {
        const opts = this.opts()
        // No code to show (invalid or empty input): forget an earlier render error too.
        if (!opts) return this.error.set(null)
        try {
          this.render(this.canvas().nativeElement, opts)
          this.error.set(null)
        } catch (e) {
          this.error.set(cleanError(e))
        }
      },
    })
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer))
  }

  protected png() {
    downloadPNG(this.canvas().nativeElement, this.filename())
    this.saveThumb()
  }

  protected svg() {
    downloadSVG(this.opts()!, this.filename())
    this.saveThumb()
  }

  protected async copy() {
    const ok = await copyImage(this.canvas().nativeElement)
    if (ok) this.saveThumb()
    this.copied.set(ok ? 'ok' : 'fail')
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.copied.set(null), 2000)
  }

  /** Small thumbnail for the recent list. */
  private saveThumb() {
    const src = this.canvas().nativeElement
    const k = Math.min(1, 96 / Math.max(src.width, src.height))
    const thumb = document.createElement('canvas')
    thumb.width = Math.round(src.width * k)
    thumb.height = Math.round(src.height * k)
    thumb.getContext('2d')?.drawImage(src, 0, 0, thumb.width, thumb.height)
    this.exported.emit(thumb.toDataURL('image/png'))
  }
}
