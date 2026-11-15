import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { BarMint } from './barmint/barmint'
import { AppFailure, Recovery } from './recovery'

/**
 * Root component. Hosts BarMint today; the portfolio pages (home, about, projects)
 * can be added here later, with BarMint as one of the projects.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BarMint, Recovery],
  template: `
    @if (failure.failed()) {
      <app-recovery />
    } @else {
      <app-barmint />
    }
  `,
})
export class Shell {
  protected readonly failure = inject(AppFailure)
}
