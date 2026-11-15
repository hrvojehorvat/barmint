import { Directive, computed, input } from '@angular/core'

/** Pill button: `<button appButton variant="primary">`. Keeps native disabled/click behaviour. */
@Directive({
  selector: 'button[appButton]',
  host: {
    type: 'button',
    class:
      'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
    '[class]': 'variantClass()',
  },
})
export class Button {
  readonly variant = input<'primary' | 'secondary'>('secondary')
  protected readonly variantClass = computed(() =>
    this.variant() === 'primary'
      ? 'bg-accent-500 text-accent-contrast hover:bg-accent-600 shadow-[0_6px_20px_-6px_color-mix(in_oklab,var(--color-accent-500)_60%,transparent)]'
      : 'bg-black/[0.06] dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/15',
  )
}
