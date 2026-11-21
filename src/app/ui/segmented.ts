import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { cx } from './cx'

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

/** iOS-style segmented control. */
@Component({
  selector: 'app-segmented',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex rounded-full bg-black/[0.06] dark:bg-white/10 p-1' },
  template: `
    @for (o of options(); track o.value) {
      <button type="button" (click)="changed.emit(o.value)" [class]="classFor(o.value)">{{ o.label }}</button>
    }
  `,
})
export class Segmented<T extends string> {
  readonly value = input.required<T>()
  readonly options = input.required<SegmentOption<T>[]>()
  readonly size = input<'sm' | 'md'>('md')
  readonly changed = output<T>()

  protected classFor(v: T) {
    return cx(
      'rounded-full font-medium transition-all duration-200',
      this.size() === 'sm' ? 'px-3 py-1 text-xs' : 'px-5 py-2 text-sm',
      this.value() === v
        ? 'bg-white dark:bg-white/20 text-neutral-900 dark:text-white shadow-sm'
        : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white',
    )
  }
}
