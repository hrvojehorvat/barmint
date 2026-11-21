import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import type { Dict } from '../../i18n'
import { FORMATS, SAMPLE_TEXT, type BarcodeData, type Format } from '../../lib/barcode'
import type { Errors } from '../../lib/payment'
import { SectionTitle } from '../ui/card'
import { cx } from '../ui/cx'
import { Field } from '../ui/field'

@Component({
  selector: 'app-barcode-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Field, SectionTitle],
  templateUrl: './barcode-form.html',
  host: { class: 'block space-y-8' },
})
export class BarcodeForm {
  readonly data = input.required<BarcodeData>()
  readonly errors = input.required<Errors<BarcodeData>>()
  readonly t = input.required<Dict>()
  readonly changed = output<BarcodeData>()

  protected readonly formats = FORMATS
  protected readonly sample = SAMPLE_TEXT
  protected readonly colors = ['fg', 'bg'] as const
  protected readonly numeric = computed(() => !!FORMATS.find((f) => f.id === this.data().format)?.digits)

  protected set<K extends keyof BarcodeData>(k: K, v: BarcodeData[K]) {
    this.changed.emit({ ...this.data(), [k]: v })
  }

  protected pickFormat(format: Format) {
    const d = this.data()
    // Keep the user's text; drop it only if it is an example value (e.g. from an older saved link).
    const isSample = Object.values(SAMPLE_TEXT).includes(d.text)
    this.changed.emit({ ...d, format, text: isSample ? '' : d.text })
  }

  protected formatClass(active: boolean) {
    return cx(
      'rounded-full px-4 py-2 text-sm font-medium transition',
      active
        ? 'bg-mint-500 text-white shadow-[0_6px_20px_-8px_rgba(31,174,136,0.7)]'
        : 'bg-black/[0.05] dark:bg-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-black/10 dark:hover:bg-white/15',
    )
  }

  protected value(e: Event) {
    return (e.target as HTMLInputElement).value
  }
}
