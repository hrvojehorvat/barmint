import { InjectionToken } from '@angular/core'
import { renderCanvas } from '../../lib/render'

/**
 * Draws a code onto a canvas. Injected so component tests (jsdom has no canvas)
 * can replace it; real rendering is covered by the scan tests in src/lib.
 */
export const CANVAS_RENDERER = new InjectionToken<typeof renderCanvas>('CANVAS_RENDERER', {
  providedIn: 'root',
  factory: () => renderCanvas,
})
