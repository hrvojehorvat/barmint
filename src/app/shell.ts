import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { BarMint } from './barmint'
import { AppFailure, Recovery } from './recovery'

/** Root component: BarMint, or the recovery screen after an error. */
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
