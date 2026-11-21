import { Directive } from '@angular/core'

/** Frosted-glass card: `<div appCard class="p-6">`. */
@Directive({
  selector: '[appCard]',
  host: {
    class:
      'block rounded-[28px] bg-white/75 dark:bg-white/[0.06] backdrop-blur-2xl ring-1 ring-black/[0.06] dark:ring-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]',
  },
})
export class Card {}

/** Small uppercase heading above a form section. */
@Directive({
  selector: '[appSectionTitle]',
  host: { class: 'block text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400 dark:text-neutral-500 mb-3' },
})
export class SectionTitle {}
