import { type ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core'
import { RecoveringErrorHandler } from './recovery'

// Zoneless by default (no zone.js): change detection runs only when signals change.
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), { provide: ErrorHandler, useClass: RecoveringErrorHandler }],
}
