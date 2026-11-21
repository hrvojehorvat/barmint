import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core'
import type { Dict } from '../../i18n'
import type { FieldError } from '../../lib/payment'
import { cx } from './cx'

/** Labelled text input with hint and inline validation message. */
@Component({
  selector: 'app-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <label class="block">
      <span class="block text-[13px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 ml-1">
        {{ label() }}
        @if (required()) {
          <span class="ml-0.5 text-accent-600 dark:text-accent-400" aria-hidden="true">*</span>
        }
      </span>
      <input
        [value]="value()"
        (input)="onInput($event)"
        (blur)="touched.set(true)"
        [attr.aria-required]="required() || null"
        [attr.aria-invalid]="shown() ? true : null"
        [attr.placeholder]="placeholder() || null"
        [attr.inputmode]="inputMode() || null"
        [attr.autocomplete]="autocomplete() || null"
        [attr.maxlength]="maxLength() ?? null"
        [attr.spellcheck]="spellcheck() ? null : false"
        [class]="inputClass()"
      />
      <span [class]="hintClass()">{{ message() || hint() }}</span>
    </label>
  `,
})
export class Field {
  readonly label = input.required<string>()
  readonly value = input.required<string>()
  readonly t = input.required<Dict>()
  readonly error = input<FieldError | undefined>()
  readonly hint = input<string>()
  readonly required = input(false)
  readonly mono = input(false)
  readonly placeholder = input<string>()
  readonly inputMode = input<string>()
  readonly autocomplete = input<string>()
  readonly maxLength = input<number>()
  readonly spellcheck = input(true)
  /** Applied while typing, e.g. IBAN grouping or upper case. */
  readonly format = input<(v: string) => string>()
  readonly changed = output<string>()

  protected readonly touched = signal(false)
  // "required" errors only appear after the field was left once; format errors show immediately.
  protected readonly shown = computed(() => {
    const e = this.error()
    return e && (e.key !== 'required' || this.touched()) ? e : undefined
  })
  protected readonly message = computed(() => {
    const e = this.shown()
    return e ? this.t().errors[e.key].replace('{n}', String(e.n ?? '')) : ''
  })
  protected readonly inputClass = computed(() =>
    cx(
      'w-full rounded-xl px-4 py-3 text-[15px] outline-none transition',
      'bg-black/[0.04] dark:bg-white/[0.07] text-neutral-900 dark:text-white placeholder:text-neutral-400',
      'ring-1 focus:bg-white dark:focus:bg-white/10 focus:ring-2',
      this.shown() ? 'ring-red-500/70 focus:ring-red-500' : 'ring-transparent focus:ring-accent-500',
      this.mono() && 'font-mono tracking-wide',
    ),
  )
  protected readonly hintClass = computed(() =>
    cx('block text-xs mt-1.5 ml-1 min-h-4', this.shown() ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500'),
  )

  protected onInput(e: Event) {
    const el = e.target as HTMLInputElement
    const fmt = this.format()
    const v = fmt ? fmt(el.value) : el.value
    // Write the formatted text back right away; the [value] binding would skip it when
    // formatting yields the previous value (e.g. a typed space that grouping removes).
    if (v !== el.value) el.value = v
    this.changed.emit(v)
  }
}
