import { ChangeDetectionStrategy, Component } from '@angular/core'
import { LucideLeaf, LucideScanBarcode } from '@lucide/angular'

/**
 * BarMint app icon. Size it from outside, e.g. `<app-barmint-logo class="h-8 w-8" />`.
 * Kept free of bwip-js so the portfolio can show it without loading BarMint.
 */
@Component({
  selector: 'app-barmint-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideScanBarcode, LucideLeaf],
  host: { class: 'relative inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <span
      class="flex h-full w-full items-center justify-center rounded-[30%] bg-gradient-to-br from-mint-300 to-mint-600 text-white shadow-[0_4px_14px_-4px_rgba(31,174,136,0.7)]"
    >
      <svg lucideScanBarcode class="h-[56%] w-[56%]"></svg>
    </span>
    <span
      class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-neutral-900 ring-1 ring-mint-200 dark:ring-mint-700"
    >
      <svg lucideLeaf class="h-2.5 w-2.5 text-mint-500" [strokeWidth]="2.5"></svg>
    </span>
  `,
})
export class BarMintLogo {}
