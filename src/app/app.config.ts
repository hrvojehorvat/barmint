import { type ApplicationConfig, ErrorHandler } from '@angular/core'
import { provideRouter, withInMemoryScrolling } from '@angular/router'
import { routes } from './app.routes'
import { RecoveringErrorHandler } from './recovery'

// Zoneless by default (no zone.js): change detection runs only when signals change.
// Only errors inside Angular (rendering, event handlers) reach the ErrorHandler and show
// the recovery screen. Global browser errors are deliberately not forwarded
// (no provideBrowserGlobalErrorListeners): harmless ones such as "ResizeObserver loop"
// warnings or extension errors would otherwise replace a working app.
export const appConfig: ApplicationConfig = {
  providers: [
    // Path URLs (/projects, /barmint). Fragments stay with the page: BarMint keeps its form state in #s=….
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    { provide: ErrorHandler, useClass: RecoveringErrorHandler },
  ],
}
