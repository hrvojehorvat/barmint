import { type ApplicationConfig, ErrorHandler } from '@angular/core'
import { RecoveringErrorHandler } from './recovery'

// Zoneless by default (no zone.js): change detection runs only when signals change.
// Only errors inside Angular (rendering, event handlers) reach the ErrorHandler and show
// the recovery screen. Global browser errors are deliberately not forwarded
// (no provideBrowserGlobalErrorListeners): harmless ones such as "ResizeObserver loop"
// warnings or extension errors would otherwise replace a working app.
export const appConfig: ApplicationConfig = {
  providers: [{ provide: ErrorHandler, useClass: RecoveringErrorHandler }],
}
