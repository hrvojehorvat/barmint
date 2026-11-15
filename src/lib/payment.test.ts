import { describe, expect, it } from 'vitest'
import {
  buildPayment,
  compact,
  defaultPayment,
  group4,
  timestamp,
  autoPurpose,
  isBic,
  isIban,
  isQrIban,
  isQrr,
  isRf,
  parseAmount,
  type PaymentData,
} from './payment'

const de = (p: Partial<PaymentData> = {}) => buildPayment({ ...defaultPayment, message: 'Rechnung 2026-042', ...p })
const ch = (p: Partial<PaymentData> = {}) =>
  buildPayment({
    ...defaultPayment,
    country: 'CH',
    currency: 'CHF',
    iban: 'CH93 0076 2011 6238 5295 7',
    ...p,
  })

describe('IBAN', () => {
  it.each(['DE89370400440532013000', 'AT611904300234573201', 'CH9300762011623852957', 'LI21088100002324013AA'])(
    'accepts %s',
    (iban) => expect(isIban(iban)).toBe(true),
  )
  it.each(['DE89370400440532013001', 'DE8937040044', 'XX00', ''])('rejects %s', (iban) =>
    expect(isIban(iban)).toBe(false),
  )
  it('formats and compacts', () => {
    expect(group4('de89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00')
    expect(compact(' de89 3704 ')).toBe('DE893704')
  })
  it('detects QR-IBANs by institution id 30000-31999', () => {
    expect(isQrIban('CH4431999123000889012')).toBe(true)
    expect(isQrIban('CH9300762011623852957')).toBe(false)
  })
})

describe('references', () => {
  it('validates RF creditor references (ISO 11649)', () => {
    expect(isRf('RF18539007547034')).toBe(true)
    expect(isRf('RF19539007547034')).toBe(false)
    expect(isRf('XX18539007547034')).toBe(false)
  })
  it('validates Swiss QR references (mod 10 recursive)', () => {
    expect(isQrr('210000000003139471430009017')).toBe(true)
    expect(isQrr('210000000003139471430009018')).toBe(false)
    expect(isQrr('21000000000313947143000901')).toBe(false)
  })
  it('validates BIC', () => {
    expect(isBic('COBADEFFXXX')).toBe(true)
    expect(isBic('COBADEFF')).toBe(true)
    expect(isBic('COBA')).toBe(false)
  })
})

describe('parseAmount', () => {
  it.each([
    ['49,90', 49.9],
    ['49.90', 49.9],
    ['1.234,56', 1234.56],
    ['1 234,5', 1234.5],
    ["1'000.00", 1000],
    ['7', 7],
  ])('parses %s', (raw, n) => expect(parseAmount(raw)).toBe(n))
  it('returns undefined for empty and null for garbage', () => {
    expect(parseAmount('  ')).toBeUndefined()
    expect(parseAmount('12,345')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('1,2,3')).toBeNull()
  })
})

describe('EPC QR (DE/AT)', () => {
  it('builds the exact EPC 002 payload', () => {
    expect(de().payload).toBe(
      'BCD\n002\n1\nSCT\n\nMax Mustermann\nDE89370400440532013000\nEUR49.90\n\n\nRechnung 2026-042',
    )
  })
  it('formats the automatic purpose as "Rechnung YYYY-MM-DD:HH:MM:SS"', () => {
    expect(timestamp(new Date(2026, 0, 5, 9, 3, 7))).toBe('2026-01-05:09:03:07')
    expect(autoPurpose(new Date(2026, 10, 15, 14, 32, 7))).toBe('Rechnung 2026-11-15:14:32:07')
  })
  it('uses the automatic purpose only when the field is empty', () => {
    expect(defaultPayment.message).toBe('')
    expect(buildPayment(defaultPayment, 'Rechnung X').payload).toMatch(/\nRechnung X$/)
    expect(buildPayment({ ...defaultPayment, message: 'Miete' }, 'Rechnung X').payload).toMatch(/\nMiete$/)
  })
  it('skips the automatic purpose when an RF reference is given', () => {
    const r = buildPayment({ ...defaultPayment, reference: 'RF18539007547034' }, 'Rechnung X')
    expect(r.errors).toEqual({})
    expect(r.payload).toMatch(/\nRF18539007547034$/)
  })
  it('includes BIC, structured reference and omits empty amount', () => {
    const r = de({ bic: 'cobadeffxxx', amount: '', reference: 'RF18 5390 0754 7034', message: '' })
    expect(r.payload).toBe('BCD\n002\n1\nSCT\nCOBADEFFXXX\nMax Mustermann\nDE89370400440532013000\n\n\nRF18539007547034')
  })
  it('works for Austrian IBANs', () => {
    expect(de({ country: 'AT', iban: 'AT61 1904 3002 3457 3201' }).payload).toContain('\nAT611904300234573201\n')
  })
  it('requires name and IBAN', () => {
    const r = de({ name: ' ', iban: '' })
    expect(r.payload).toBeNull()
    expect(r.errors).toEqual({ name: { key: 'required' }, iban: { key: 'required' } })
  })
  it('rejects bad values', () => {
    const r = de({ iban: 'DE89370400440532013001', bic: 'XX', amount: '0', reference: 'RF00123' })
    expect(r.errors.iban?.key).toBe('ibanInvalid')
    expect(r.errors.bic?.key).toBe('bicInvalid')
    expect(r.errors.amount?.key).toBe('amountRange')
    expect(r.errors.reference?.key).toBe('rfInvalid')
  })
  it('forbids reference and purpose together', () => {
    expect(de({ reference: 'RF18539007547034' }).errors.reference?.key).toBe('refOrMessage')
  })
  it('enforces length limits', () => {
    expect(de({ name: 'x'.repeat(71) }).errors.name).toEqual({ key: 'tooLong', n: 70 })
    expect(de({ message: 'x'.repeat(141) }).errors.message).toEqual({ key: 'tooLong', n: 140 })
  })
})

describe('Swiss QR-bill (CH)', () => {
  it('builds a 31-line SPC 0200 payload', () => {
    const lines = ch().payload!.split('\n')
    expect(lines).toHaveLength(31)
    expect(lines.slice(0, 11)).toEqual([
      'SPC', '0200', '1', 'CH9300762011623852957',
      'S', 'Max Mustermann', 'Bahnhofstrasse', '1', '8001', 'Zürich', 'CH',
    ])
    expect(lines.slice(11, 18)).toEqual(Array(7).fill(''))
    expect(lines[18]).toBe('49.90')
    expect(lines[19]).toBe('CHF')
    expect(lines.slice(20, 27)).toEqual(Array(7).fill(''))
    expect(lines.slice(27)).toEqual(['NON', '', '', 'EPD'])
  })
  it('uses SCOR for RF references on a normal IBAN', () => {
    const lines = ch({ reference: 'RF18539007547034' }).payload!.split('\n')
    expect(lines.slice(27, 29)).toEqual(['SCOR', 'RF18539007547034'])
  })
  it('requires a valid QRR reference with a QR-IBAN', () => {
    expect(ch({ iban: 'CH4431999123000889012' }).errors.reference?.key).toBe('qrrRequired')
    expect(ch({ iban: 'CH4431999123000889012', reference: '210000000003139471430009018' }).errors.reference?.key).toBe(
      'qrrInvalid',
    )
    const ok = ch({ iban: 'CH4431999123000889012', reference: '210000000003139471430009017' })
    expect(ok.payload!.split('\n').slice(27, 29)).toEqual(['QRR', '210000000003139471430009017'])
  })
  it('rejects a QR reference on a normal IBAN', () => {
    expect(ch({ reference: '210000000003139471430009017' }).errors.reference?.key).toBe('qrrNotAllowed')
  })
  it('rejects non-Swiss IBANs', () => {
    expect(ch({ iban: 'DE89370400440532013000' }).errors.iban?.key).toBe('ibanCh')
  })
  it('requires creditor postcode and city', () => {
    const r = ch({ zip: '', city: '' })
    expect(r.errors.zip?.key).toBe('required')
    expect(r.errors.city?.key).toBe('required')
  })
  it('adds the debtor block when a payer name is given', () => {
    const r = ch({ dName: 'Anna Muster', dStreet: 'Weg', dHouseNo: '2', dZip: '3000', dCity: 'Bern', dCountry: 'ch' })
    expect(r.payload!.split('\n').slice(20, 27)).toEqual(['S', 'Anna Muster', 'Weg', '2', '3000', 'Bern', 'CH'])
  })
  it('validates the debtor address when a payer name is given', () => {
    const r = ch({ dName: 'Anna', dCountry: 'Schweiz' })
    expect(r.errors.dZip?.key).toBe('required')
    expect(r.errors.dCity?.key).toBe('required')
    expect(r.errors.dCountry?.key).toBe('countryInvalid')
  })
})
