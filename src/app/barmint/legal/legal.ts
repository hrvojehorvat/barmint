import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { LucideArrowLeft } from '@lucide/angular'
import type { Lang } from '../../../i18n'
import { LEGAL, isPlaceholder } from '../../../legal'
import { Card } from '../../ui/card'

export type LegalPage = 'impressum' | 'datenschutz'

export const legalPageFromHash = (hash: string): LegalPage | null =>
  hash === '#impressum' || hash === '#datenschutz' ? (hash.slice(1) as LegalPage) : null

/** Impressum and privacy policy (German and English). Values come from src/legal.ts. */
@Component({
  selector: 'app-legal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, LucideArrowLeft, NgTemplateOutlet],
  templateUrl: './legal.html',
  host: { class: 'block mx-auto max-w-3xl pt-10' },
})
export class Legal {
  readonly page = input.required<LegalPage>()
  readonly lang = input.required<Lang>()
  readonly back = output<void>()

  protected readonly L = LEGAL
  protected readonly isPlaceholder = isPlaceholder
}
