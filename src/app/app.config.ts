import { type ApplicationConfig, ErrorHandler } from '@angular/core'
import { provideRouter, withInMemoryScrolling, type Routes } from '@angular/router'
import { routes } from './app.routes'
import { RecoveringErrorHandler } from './recovery'

// Zoneless by default (no zone.js): change detection runs only when signals change.
// Only errors inside Angular (rendering, event handlers) reach the ErrorHandler and show
// the recovery screen. Global browser errors are deliberately not forwarded
// (no provideBrowserGlobalErrorListeners): harmless ones such as "ResizeObserver loop"
// warnings or extension errors would otherwise replace a working app.
/** App setup with the given pages (the routes differ per domain, see app.routes.ts). */
export const configFor = (pages: Routes): ApplicationConfig => ({
  providers: [
    // Path URLs (/projects). Projects at their own address (barmint., plumcast.mrvoje.com) are normal links.
    provideRouter(pages, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    { provide: ErrorHandler, useClass: RecoveringErrorHandler },
  ],
})

export const appConfig = configFor(routes)
