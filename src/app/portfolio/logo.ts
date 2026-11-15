import { ChangeDetectionStrategy, Component } from '@angular/core'

/**
 * "mrvoje" wordmark (drawn with strokes). When a parent with the `group` class is hovered or
 * focused, the "m" morphs into an "h" and it reads "hrvoje": the second leg of the m fades,
 * an ascender grows on the first stem, and the rest slides left by one leg.
 * Size it from outside via height, e.g. `class="h-6"`. Colour follows `currentColor`.
 * Based on the design reference in /logo (Morph.dc.html).
 */
@Component({
  selector: 'app-mrvoje-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block', 'aria-hidden': 'true' },
  template: `
    <svg
      viewBox="0 14 310 120"
      class="block h-full w-auto overflow-visible"
      fill="none"
      stroke="currentColor"
      stroke-width="11"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- ascender that turns the m into an h -->
      <path
        d="M6,50 V20"
        class="origin-bottom [transform-box:fill-box] scale-y-0 transition-[scale] duration-500 ease-in-out motion-reduce:transition-none group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />
      <!-- first stem and arch of the m (the h's body) -->
      <path d="M6,100 V62 Q6,50 22,50 Q38,50 38,62 V100" />
      <!-- second arch of the m -->
      <path
        d="M38,62 Q38,50 54,50 Q70,50 70,62 V100"
        class="transition-opacity duration-500 ease-in-out motion-reduce:transition-none group-hover:opacity-0 group-focus-visible:opacity-0"
      />
      <g
        class="transition-[translate] duration-500 ease-in-out motion-reduce:transition-none group-hover:-translate-x-8 group-focus-visible:-translate-x-8"
      >
        <path d="M86,100 V62 Q86,50 100,50 H112" />
        <path d="M126,50 L146,100 L166,50" />
        <ellipse cx="198" cy="75" rx="19" ry="25" />
        <path d="M244,50 V115 Q244,128 230,128" />
        <circle cx="244" cy="30" r="6.5" fill="currentColor" stroke="none" />
        <path d="M268,75 H304 Q304,50 286,50 Q268,50 268,75 Q268,100 286,100 Q298,100 303,92" />
      </g>
    </svg>
  `,
})
export class MrvojeLogo {}
