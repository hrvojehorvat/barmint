import type { ErrKey } from './lib/payment'

export type Lang = 'en' | 'de'

const en = {
  appName: 'BarMint',
  heroTitle: 'Payment codes.',
  heroAccent: 'Beautifully simple.',
  heroSub:
    'Create GiroCodes, EPC QR codes and Swiss QR-bills for Germany, Austria and Switzerland, plus classic barcodes. Everything happens in your browser. Nothing is uploaded.',
  modes: { payment: 'Payment code', barcode: 'Barcode' },
  country: 'Country',
  countries: { DE: 'Germany', AT: 'Austria', CH: 'Switzerland' },
  standards: { DE: 'GiroCode · EPC QR', AT: 'EPC QR · Zahlen mit Code', CH: 'Swiss QR-bill' },
  sections: { recipient: 'Recipient', payment: 'Payment', payer: 'Payer (optional)' },
  f: {
    name: 'Name',
    iban: 'IBAN',
    bic: 'BIC',
    amount: 'Amount',
    currency: 'Currency',
    reference: 'Reference',
    message: 'Purpose',
    street: 'Street',
    houseNo: 'No.',
    zip: 'Postcode',
    city: 'City',
    dCountry: 'Country code',
  },
  hints: {
    optional: 'Optional',
    amount: 'Leave empty to let the payer enter it',
    refEpc: 'Optional RF creditor reference, e.g. RF18 5390 0754 7034',
    refQrr: '27-digit QR reference, required for QR-IBAN',
    refScor: 'Optional RF creditor reference',
    message: 'Leave empty to use the text shown',
    payer: 'Add who pays this bill (printed as “Payable by”)',
    incomplete: 'Incomplete',
  },
  barcode: {
    format: 'Format',
    content: 'Content',
    fg: 'Bars',
    bg: 'Background',
    size: 'Resolution',
    showText: 'Show text',
  },
  preview: 'Preview',
  png: 'PNG',
  svg: 'SVG',
  copy: 'Copy',
  copied: 'Copied',
  copyFailed: 'Copy failed',
  swissNote:
    'This is the Swiss QR code only, ready to scan with a banking app. On invoices, Swiss rules require the full payment part (receipt and payment slip) with the code printed at 46 × 46 mm. Use SVG for sharp printing.',
  empty: 'Fill in the required fields to see your code.',
  requiredNote: 'Required field',
  history: 'Recent',
  clear: 'Clear',
  share: 'Copy link',
  linkCopied: 'Link copied',
  footer: 'Runs 100% in your browser. Your data never leaves your device.',
  legal: { impressum: 'Legal notice', privacy: 'Privacy' },
  errors: {
    required: 'Required',
    tooLong: 'Too long (max. {n} characters)',
    ibanInvalid: 'Invalid IBAN',
    ibanCh: 'Swiss QR-bills need a CH or LI IBAN',
    bicInvalid: 'Invalid BIC',
    amountInvalid: 'Invalid amount',
    amountRange: 'Must be between 0.01 and 999,999,999.99',
    rfInvalid: 'Invalid RF reference',
    qrrRequired: 'A QR-IBAN requires a 27-digit QR reference',
    qrrInvalid: 'Invalid QR reference (check digit)',
    qrrNotAllowed: 'QR references only work with a QR-IBAN',
    refOrMessage: 'Use either a reference or a purpose, not both',
    countryInvalid: 'Use a 2-letter code, e.g. CH',
    digits: 'Needs {n} digits',
    charInvalid: 'Not allowed in payment codes: {n}',
    payloadTooLong: 'Too long for the code. Shorten by {n} characters',
  } satisfies Record<ErrKey, string>,
  renderError: 'Could not render',
}

export type Dict = typeof en

const de: Dict = {
  appName: 'BarMint',
  heroTitle: 'Zahlungscodes.',
  heroAccent: 'Einfach schön.',
  heroSub:
    'Erstelle GiroCodes, EPC-QR-Codes und Schweizer QR-Rechnungen für Deutschland, Österreich und die Schweiz, dazu klassische Barcodes. Alles läuft in deinem Browser. Nichts wird hochgeladen.',
  modes: { payment: 'Zahlungscode', barcode: 'Barcode' },
  country: 'Land',
  countries: { DE: 'Deutschland', AT: 'Österreich', CH: 'Schweiz' },
  standards: { DE: 'GiroCode · EPC QR', AT: 'EPC QR · Zahlen mit Code', CH: 'Swiss QR-bill' },
  sections: { recipient: 'Empfänger', payment: 'Zahlung', payer: 'Zahler (optional)' },
  f: {
    name: 'Name',
    iban: 'IBAN',
    bic: 'BIC',
    amount: 'Betrag',
    currency: 'Währung',
    reference: 'Referenz',
    message: 'Verwendungszweck',
    street: 'Straße',
    houseNo: 'Nr.',
    zip: 'PLZ',
    city: 'Ort',
    dCountry: 'Ländercode',
  },
  hints: {
    optional: 'Optional',
    amount: 'Leer lassen, damit der Zahler ihn eingibt',
    refEpc: 'Optionale RF-Gläubigerreferenz, z. B. RF18 5390 0754 7034',
    refQrr: '27-stellige QR-Referenz, Pflicht bei QR-IBAN',
    refScor: 'Optionale RF-Gläubigerreferenz',
    message: 'Leer lassen, um den angezeigten Text zu verwenden',
    payer: 'Angeben, wer die Rechnung bezahlt („Zahlbar durch“)',
    incomplete: 'Unvollständig',
  },
  barcode: {
    format: 'Format',
    content: 'Inhalt',
    fg: 'Balken',
    bg: 'Hintergrund',
    size: 'Auflösung',
    showText: 'Text anzeigen',
  },
  preview: 'Vorschau',
  png: 'PNG',
  svg: 'SVG',
  copy: 'Kopieren',
  copied: 'Kopiert',
  copyFailed: 'Fehlgeschlagen',
  swissNote:
    'Dies ist nur der Swiss QR Code, direkt scanbar mit einer Banking-App. Auf Rechnungen verlangen die Schweizer Vorgaben den vollständigen Zahlteil (Empfangsschein und Zahlteil) mit dem Code in 46 × 46 mm. Für scharfen Druck SVG verwenden.',
  empty: 'Fülle die Pflichtfelder aus, um deinen Code zu sehen.',
  requiredNote: 'Pflichtfeld',
  history: 'Zuletzt',
  clear: 'Löschen',
  share: 'Link kopieren',
  linkCopied: 'Link kopiert',
  footer: 'Läuft zu 100 % im Browser. Deine Daten verlassen nie dein Gerät.',
  legal: { impressum: 'Impressum', privacy: 'Datenschutz' },
  errors: {
    required: 'Pflichtfeld',
    tooLong: 'Zu lang (max. {n} Zeichen)',
    ibanInvalid: 'Ungültige IBAN',
    ibanCh: 'QR-Rechnungen benötigen eine CH- oder LI-IBAN',
    bicInvalid: 'Ungültige BIC',
    amountInvalid: 'Ungültiger Betrag',
    amountRange: 'Muss zwischen 0,01 und 999.999.999,99 liegen',
    rfInvalid: 'Ungültige RF-Referenz',
    qrrRequired: 'Eine QR-IBAN erfordert eine 27-stellige QR-Referenz',
    qrrInvalid: 'Ungültige QR-Referenz (Prüfziffer)',
    qrrNotAllowed: 'QR-Referenzen funktionieren nur mit einer QR-IBAN',
    refOrMessage: 'Entweder Referenz oder Verwendungszweck, nicht beides',
    countryInvalid: 'Zweistelliger Code, z. B. CH',
    digits: 'Benötigt {n} Ziffern',
    charInvalid: 'In Zahlungscodes nicht erlaubt: {n}',
    payloadTooLong: 'Zu lang für den Code. Um {n} Zeichen kürzen',
  },
  renderError: 'Darstellung nicht möglich',
}

export const dicts: Record<Lang, Dict> = { en, de }

export const detectLang = (): Lang => {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'en' || saved === 'de') return saved
  } catch {
    /* ignore */
  }
  return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'
}
