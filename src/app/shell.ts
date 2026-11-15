import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AppFailure, Recovery } from './recovery'

/** Root component: the routed page (portfolio or a project), or the recovery screen after an error. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Recovery, RouterOutlet],
  template: `
    @if (failure.failed()) {
      <app-recovery />
    } @else {
      <router-outlet />
    }
  `,
})
export class Shell {
  protected readonly failure = inject(AppFailure)
}
