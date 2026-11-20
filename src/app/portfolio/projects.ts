/**
 * Projects shown on the portfolio. Add new ones here.
 * `theme` is the project's accent class from styles.css (same design, own colour).
 */
export interface Project {
  slug: string
  name: string
  tagline: string
  description: string
  tags: string[]
  theme: string
  /** Project has its own logo component (shown on the card); otherwise a plain accent tile. */
  logo?: 'barmint' | 'plumcast'
}

export const PROJECTS: Project[] = [
  {
    slug: 'barmint',
    name: 'BarMint',
    tagline: 'Payment QR codes and barcodes',
    description:
      'GiroCode, EPC QR and Swiss QR-bill generator for Germany, Austria and Switzerland, plus classic barcodes. Runs entirely in the browser, with no backend and no tracking.',
    tags: ['Angular', 'TypeScript', 'Tailwind CSS'],
    theme: 'theme-mint',
    logo: 'barmint',
  },
  {
    slug: 'plumcast',
    name: 'Plumcast',
    tagline: 'IPTV player for Android TV, Fire TV and phones',
    description:
      'Bring your own playlist: Live TV, catch-up, a TV guide, films and series. Built for the TV remote first, with no account and no tracking.',
    tags: ['React Native', 'TypeScript', 'Android TV'],
    theme: 'theme-purple',
    logo: 'plumcast',
  },
]
