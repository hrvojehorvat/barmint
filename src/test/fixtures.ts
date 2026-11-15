import { defaultBarcode, SAMPLE_TEXT, type BarcodeData } from '../lib/barcode'
import { defaultPayment, SAMPLE_IBAN, type PaymentData } from '../lib/payment'

/** A complete, valid payment form (the app itself starts empty). */
export const samplePayment: PaymentData = {
  ...defaultPayment,
  name: 'Max Mustermann',
  iban: SAMPLE_IBAN.DE,
  amount: '49,90',
  street: 'Bahnhofstrasse',
  houseNo: '1',
  zip: '8001',
  city: 'Zürich',
}

export const sampleSwiss: PaymentData = { ...samplePayment, country: 'CH', currency: 'CHF', iban: SAMPLE_IBAN.CH }

export const sampleBarcode: BarcodeData = { ...defaultBarcode, text: SAMPLE_TEXT.code128 }
