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
  logo?: 'barmint'
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
]
