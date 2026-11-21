import { ChangeDetectionStrategy, Component } from '@angular/core'

/**
 * Plumcast app icon (same drawing as src/ui/Logo.tsx in the plumcast repo): a plum with a leaf and a play mark.
 * Size it from outside, e.g. `<app-plumcast-logo class="h-11 w-11" />`.
 */
@Component({
  selector: 'app-plumcast-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 40 40" class="h-full w-full drop-shadow-[0_4px_14px_rgba(138,67,192,0.45)]">
      <defs>
        <linearGradient id="plumcast-logo-plum" x1="0.2" y1="0.1" x2="0.8" y2="1">
          <stop offset="0" stop-color="#c58cf0" />
          <stop offset="1" stop-color="#6a2aa3" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="#1a1424" />
      <circle cx="20" cy="22.5" r="11.5" fill="url(#plumcast-logo-plum)" />
      <path d="M20.3 11.2c.1-1.6.6-3 1.6-4.2" fill="none" stroke="#b98ad8" stroke-width="1.4" stroke-linecap="round" />
      <path d="M21.2 9.6c1.3-3.3 4.6-4.6 7.8-4-.6 3.1-3.6 5.4-7.8 4z" fill="#8fdc9c" />
      <path d="M17.2 17.3v10.4l8.3-5.2z" fill="#fff" stroke="#fff" stroke-width="1" stroke-linejoin="round" />
    </svg>
  `,
})
export class PlumcastLogo {}
