import { ChangeDetectionStrategy, Component, ErrorHandler, Injectable, inject, signal } from '@angular/core'

/** Set once an unexpected error happened; the shell then shows the recovery screen. */
@Injectable({ providedIn: 'root' })
export class AppFailure {
  readonly failed = signal(false)
}

/** Last line of defence: never leave a white screen, always offer a way back. */
@Injectable()
export class RecoveringErrorHandler implements ErrorHandler {
  private readonly failure = inject(AppFailure)

  handleError(error: unknown) {
    console.error(error)
    this.failure.failed.set(true)
  }
}

const text = { title: 'Something went wrong', body: 'This page could not be shown. Go back to the start page.', reset: 'Start page' }

@Component({
  selector: 'app-recovery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="alert" class="flex min-h-screen items-center justify-center p-6 text-center">
      <div class="max-w-sm">
        <h1 class="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">{{ t.title }}</h1>
        <p class="mt-3 text-neutral-500 dark:text-neutral-400">{{ t.body }}</p>
        <button
          type="button"
          (click)="reset()"
          class="mt-6 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-accent-contrast hover:bg-accent-600"
        >
          {{ t.reset }}
        </button>
      </div>
    </div>
  `,
})
export class Recovery {
  protected readonly t = text

  protected reset() {
    location.assign('/')
  }
}
