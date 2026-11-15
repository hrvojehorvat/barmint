import { describe, expect, it } from 'vitest'
import { SAMPLE_TEXT, defaultBarcode, validateBarcode, type Format } from './barcode'

const v = (format: Format, text: string) => validateBarcode({ ...defaultBarcode, format, text })

describe('validateBarcode', () => {
  it('accepts every sample', () => {
    for (const [f, text] of Object.entries(SAMPLE_TEXT)) expect(v(f as Format, text)).toEqual({})
  })
  it('requires content', () => expect(v('code128', '  ').text?.key).toBe('required'))
  it.each([
    ['ean13', '12345', '12/13'],
    ['ean8', '123456789', '7/8'],
    ['upca', '1234567890', '11/12'],
    ['ean13', '40063813339AB', '12/13'],
  ] as const)('%s rejects %s', (f, text, n) => expect(v(f, text).text).toEqual({ key: 'digits', n }))
  it('accepts EAN-13 with or without check digit', () => {
    expect(v('ean13', '400638133393')).toEqual({})
    expect(v('ean13', '4006381333931')).toEqual({})
  })
})
