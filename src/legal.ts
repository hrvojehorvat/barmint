/**
 * Legal details for the Impressum and privacy policy.
 * Replace every value in [brackets] before going live. Anything still in brackets is
 * highlighted on the page so it can't slip through unnoticed.
 */
export const LEGAL = {
  /** Full name of the person (or company) responsible for the site. */
  name: 'Hrvoje Mrvoje',
  street: 'Flurgase 23',
  city: 'Graz',
  country: 'Österreich',
  email: 'hmrvoje@gmail.com',
  /** Optional: leave empty to hide. */
  phone: '',
  /** Optional: VAT ID (USt-IdNr. / UID), only if you have one. */
  vatId: '',
  /** Date the privacy policy was last changed. */
  updated: '2026-11-15',
}

export const isPlaceholder = (v: string) => /^\[.*\]$/.test(v)
