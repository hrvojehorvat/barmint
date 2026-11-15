export type Country = 'DE' | 'AT' | 'CH'
export type Currency = 'EUR' | 'CHF'

export interface PaymentData {
  country: Country
  name: string
  iban: string
  bic: string
  amount: string
  currency: Currency
  reference: string
  message: string
  // Swiss QR-bill: creditor address
  street: string
  houseNo: string
  zip: string
  city: string
  // Swiss QR-bill: debtor (optional)
  dName: string
  dStreet: string
  dHouseNo: string
  dZip: string
  dCity: string
  dCountry: string
}

export type ErrKey =
  | 'required'
  | 'tooLong'
  | 'ibanInvalid'
  | 'ibanCh'
  | 'bicInvalid'
  | 'amountInvalid'
  | 'amountRange'
  | 'rfInvalid'
  | 'qrrRequired'
  | 'qrrInvalid'
  | 'qrrNotAllowed'
  | 'refOrMessage'
  | 'countryInvalid'
  | 'digits'
  | 'charInvalid'
  | 'payloadTooLong'

export interface FieldError {
  key: ErrKey
  n?: string | number
}

export type Errors<T> = Partial<Record<keyof T, FieldError>>

export const SAMPLE_IBAN: Record<Country, string> = {
  DE: 'DE89 3704 0044 0532 0130 00',
  AT: 'AT61 1904 3002 3457 3201',
  CH: 'CH93 0076 2011 6238 5295 7',
}

/** Local time as YYYY-MM-DD:HH:MM:SS, used for the automatic purpose text. */
export function timestamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}:${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export const defaultPayment: PaymentData = {
  country: 'DE',
  name: 'Max Mustermann',
  iban: SAMPLE_IBAN.DE,
  bic: '',
  amount: '49,90',
  currency: 'EUR',
  reference: '',
  message: '',
  street: 'Bahnhofstrasse',
  houseNo: '1',
  zip: '8001',
  city: 'Zürich',
  dName: '',
  dStreet: '',
  dHouseNo: '',
  dZip: '',
  dCity: '',
  dCountry: 'CH',
}

/** Remove whitespace and uppercase. */
export const compact = (s: string) => s.replace(/\s+/g, '').toUpperCase()

/** Group into blocks of 4 for display (IBAN / references). */
export const group4 = (s: string) => compact(s).replace(/(.{4})(?=.)/g, '$1 ')

/** ISO 7064 mod 97-10 as used by IBAN and RF creditor references. */
function mod97(s: string): number {
  const r = s.slice(4) + s.slice(0, 4)
  let rem = 0
  for (const ch of r) {
    const v = ch >= 'A' ? String(ch.charCodeAt(0) - 55) : ch
    for (const d of v) rem = (rem * 10 + Number(d)) % 97
  }
  return rem
}

export const isIban = (s: string) => /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s) && mod97(s) === 1
export const isRf = (s: string) => /^RF\d{2}[A-Z0-9]{1,21}$/.test(s) && mod97(s) === 1
export const isBic = (s: string) => /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(s)

/** Swiss QR reference: 27 digits, recursive mod 10 check digit. */
export function isQrr(s: string): boolean {
  if (!/^\d{27}$/.test(s)) return false
  const t = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
  let c = 0
  for (const d of s.slice(0, 26)) c = t[(c + Number(d)) % 10]
  return (10 - c) % 10 === Number(s[26])
}

/** QR-IBANs use an institution ID between 30000 and 31999. */
export const isQrIban = (iban: string) => {
  const iid = Number(iban.slice(4, 9))
  return iid >= 30000 && iid <= 31999
}

/** Accepts "1.234,56", "1234.56", "1 234,5". Returns undefined if empty, null if invalid. */
export function parseAmount(raw: string): number | null | undefined {
  let s = raw.replace(/[\s']/g, '')
  if (!s) return undefined
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null
  return Number(s)
}

/**
 * Characters allowed in payment codes: the Swiss QR-bill set (Implementation Guidelines 2.3),
 * i.e. Basic Latin, Latin-1, Latin Extended-A, Ș ș Ț ț and €. It covers German, French, Italian
 * and Croatian names. EPC banks accept the same Latin letters (umlauts included). Emoji,
 * non-Latin scripts, control characters and line breaks are rejected; a line break would
 * also break the line-based payload.
 */
const DISALLOWED = /[^\x20-\x7E\xA0-\u017F\u0218-\u021B\u20AC]/gu

/** Distinct disallowed characters in `s`, e.g. "😀 ✓". Empty if all are fine. */
export function badChars(s: string): string {
  return [...new Set(s.match(DISALLOWED) ?? [])]
    .slice(0, 3)
    .map((c) => (/\p{Cc}/u.test(c) ? `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}` : c))
    .join(' ')
}

/** EPC069-12: the whole payload must not exceed 331 bytes (UTF-8). */
export const EPC_MAX_BYTES = 331
const byteLength = (s: string) => new TextEncoder().encode(s).length

export interface PaymentResult {
  payload: string | null
  errors: Errors<PaymentData>
  standard: 'epc' | 'swiss'
}

/** Purpose used when the field is left empty, e.g. "Rechnung 2026-11-15:14:32:07". */
export const autoPurpose = (d = new Date()) => `Rechnung ${timestamp(d)}`

/** `fallbackMessage` fills an empty purpose, unless a reference is given (EPC allows only one). */
export function buildPayment(p: PaymentData, fallbackMessage = ''): PaymentResult {
  const errors: Errors<PaymentData> = {}
  const swiss = p.country === 'CH'
  const t = (v: string) => v.trim()

  const check = (k: keyof PaymentData, max: number, required: boolean) => {
    const v = t(p[k] as string)
    const bad = badChars(v)
    if (!v) {
      if (required) errors[k] = { key: 'required' }
    } else if (bad) errors[k] = { key: 'charInvalid', n: bad }
    else if (v.length > max) errors[k] = { key: 'tooLong', n: max }
  }
  const need = (k: keyof PaymentData, max: number) => check(k, max, true)
  const opt = (k: keyof PaymentData, max: number) => check(k, max, false)

  need('name', 70)

  const iban = compact(p.iban)
  if (!iban) errors.iban = { key: 'required' }
  else if (!isIban(iban)) errors.iban = { key: 'ibanInvalid' }
  else if (swiss && !/^(CH|LI)/.test(iban)) errors.iban = { key: 'ibanCh' }

  const amount = parseAmount(p.amount)
  if (amount === null) errors.amount = { key: 'amountInvalid' }
  else if (amount !== undefined && (amount < 0.01 || amount > 999999999.99))
    errors.amount = { key: 'amountRange' }

  opt('message', 140)
  const ref = compact(p.reference)
  const typed = t(p.message)
  const message = typed || (ref ? '' : fallbackMessage)

  if (!swiss) {
    const bic = compact(p.bic)
    if (bic && !isBic(bic)) errors.bic = { key: 'bicInvalid' }
    if (ref && !isRf(ref)) errors.reference = { key: 'rfInvalid' }
    else if (ref && typed) errors.reference = { key: 'refOrMessage' }

    if (Object.keys(errors).length) return { payload: null, errors, standard: 'epc' }
    const lines = [
      'BCD',
      '002',
      '1',
      'SCT',
      bic,
      t(p.name),
      iban,
      amount != null ? `EUR${amount.toFixed(2)}` : '',
      '',
      ref,
      ref ? '' : message,
    ]
    const payload = lines.join('\n').trimEnd()
    const over = byteLength(payload) - EPC_MAX_BYTES
    if (over > 0) {
      // Only a long purpose can push it over (other fields are short); umlauts count as 2 bytes.
      errors.message = { key: 'payloadTooLong', n: over }
      return { payload: null, errors, standard: 'epc' }
    }
    return { payload, errors, standard: 'epc' }
  }

  // Swiss QR-bill (SPC 0200)
  opt('street', 70)
  opt('houseNo', 16)
  need('zip', 16)
  need('city', 35)

  let refType = 'NON'
  if (iban && !errors.iban && isQrIban(iban)) {
    refType = 'QRR'
    if (!ref) errors.reference = { key: 'qrrRequired' }
    else if (!isQrr(ref)) errors.reference = { key: 'qrrInvalid' }
  } else if (ref) {
    if (/^\d{27}$/.test(ref)) errors.reference = { key: 'qrrNotAllowed' }
    else if (!isRf(ref)) errors.reference = { key: 'rfInvalid' }
    else refType = 'SCOR'
  }

  const hasDebtor = !!t(p.dName)
  if (hasDebtor) {
    opt('dName', 70)
    opt('dStreet', 70)
    opt('dHouseNo', 16)
    need('dZip', 16)
    need('dCity', 35)
    if (!/^[A-Z]{2}$/.test(compact(p.dCountry))) errors.dCountry = { key: 'countryInvalid' }
  }

  if (Object.keys(errors).length) return { payload: null, errors, standard: 'swiss' }

  const creditor = ['S', t(p.name), t(p.street), t(p.houseNo), t(p.zip), t(p.city), iban.slice(0, 2)]
  const debtor = hasDebtor
    ? ['S', t(p.dName), t(p.dStreet), t(p.dHouseNo), t(p.dZip), t(p.dCity), compact(p.dCountry)]
    : ['', '', '', '', '', '', '']
  const lines = [
    'SPC',
    '0200',
    '1',
    iban,
    ...creditor,
    '', '', '', '', '', '', '', // ultimate creditor (reserved)
    amount != null ? amount.toFixed(2) : '',
    p.currency,
    ...debtor,
    refType,
    refType === 'NON' ? '' : ref,
    message,
    'EPD',
  ]
  return { payload: lines.join('\n'), errors, standard: 'swiss' }
}
