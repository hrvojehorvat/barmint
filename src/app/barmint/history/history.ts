import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import type { Dict } from '../../../i18n'
import type { HistoryItem } from '../../../lib/storage'
import { Card } from '../../ui/card'

@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card],
  host: { class: 'block' },
  template: `
    @if (items().length) {
      <div appCard class="p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-neutral-900 dark:text-white">{{ t().history }}</h2>
          <button
            type="button"
            (click)="cleared.emit()"
            class="text-xs font-medium text-mint-600 dark:text-mint-400 hover:underline"
          >
            {{ t().clear }}
          </button>
        </div>
        <ul class="space-y-1">
          @for (i of items(); track i.id) {
            <li>
              <button
                type="button"
                (click)="picked.emit(i)"
                class="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-black/5 p-1">
                  @if (i.thumb) {
                    <img [src]="i.thumb" alt="" class="max-h-full max-w-full" />
                  }
                </span>
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{{ i.label }}</span>
                  <span class="block text-xs text-neutral-400">{{ date(i.ts) }}</span>
                </span>
              </button>
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class History {
  readonly items = input.required<HistoryItem[]>()
  readonly t = input.required<Dict>()
  readonly picked = output<HistoryItem>()
  readonly cleared = output<void>()

  protected date(ts: number) {
    return new Date(ts).toLocaleString()
  }
}
