import { TestBed } from '@angular/core/testing'
import { render, screen, within } from '@testing-library/angular'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SAMPLE_IBAN, type PaymentData } from '../../lib/payment'
import { defaultState, writeUrlState } from '../../lib/storage'
import { samplePayment, sampleSwiss } from '../../test/fixtures'
import { CANVAS_RENDERER } from '../canvas-renderer'
import { BarMint } from './barmint'

// jsdom has no canvas; rendering itself is covered by scan.test.ts.
const setup = async () => {
  const user = userEvent.setup()
  const view = await render(BarMint, { providers: [{ provide: CANVAS_RENDERER, useValue: () => {} }] })
  return { user, view, stable: () => view.fixture.whenStable() }
}

const field = (name: RegExp) => screen.getByRole('textbox', { name })
const png = () => screen.getByRole('button', { name: /png/i })
/** Start from a filled-in form, as if opened from a shared link. */
const seed = (payment: PaymentData = samplePayment) => writeUrlState({ ...defaultState, payment })

beforeEach(() => localStorage.setItem('lang', 'en'))

describe('BarMint app', () => {
  it('shows the brand', async () => {
    await setup()
    expect(screen.getByText('Mint')).toBeInTheDocument()
  })

  it('marks required fields in the payment form', async () => {
    await setup()
    expect(field(/^Name/)).toHaveAttribute('aria-required', 'true')
    expect(field(/^IBAN/)).toHaveAttribute('aria-required', 'true')
    expect(field(/^BIC/)).not.toHaveAttribute('aria-required')
    expect(field(/^Amount/)).not.toHaveAttribute('aria-required')
  })

  it('starts empty, with example values only as placeholders', async () => {
    await setup()
    expect(field(/^Name/)).toHaveValue('')
    expect(field(/^Name/)).toHaveAttribute('placeholder', 'Max Mustermann')
    expect(field(/^IBAN/)).toHaveValue('')
    expect(field(/^IBAN/)).toHaveAttribute('placeholder', SAMPLE_IBAN.DE)
    expect(field(/^Amount/)).toHaveValue('')
    expect(screen.getByText(/Fill in the required fields/)).toBeInTheDocument()
    expect(screen.queryByText('Required')).toBeNull()
    expect(png()).toBeDisabled()
  })

  it('enables export once name and IBAN are filled in', async () => {
    const { user, stable } = await setup()
    await user.type(field(/^Name/), 'Max Mustermann')
    await user.type(field(/^IBAN/), SAMPLE_IBAN.DE)
    await stable()
    expect(png()).toBeEnabled()
  })

  it('shows an IBAN error immediately and disables export', async () => {
    const { user, stable } = await setup()
    const iban = field(/^IBAN/)
    await user.type(iban, 'DE89370400440532013001')
    await stable()
    expect(iban).toHaveValue('DE89 3704 0044 0532 0130 01')
    expect(screen.getByText('Invalid IBAN')).toBeInTheDocument()
    expect(iban).toHaveAttribute('aria-invalid', 'true')
    expect(png()).toBeDisabled()
  })

  it('shows "Required" only after leaving an emptied field', async () => {
    const { user, stable } = await setup()
    await user.click(field(/^Name/))
    await stable()
    expect(screen.queryByText('Required')).not.toBeInTheDocument()
    await user.tab()
    await stable()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('switches to Swiss QR-bill with address fields and CHF', async () => {
    const { user, stable } = await setup()
    await user.click(screen.getByRole('button', { name: /Switzerland/ }))
    await stable()
    expect(field(/^IBAN/)).toHaveAttribute('placeholder', SAMPLE_IBAN.CH)
    expect(screen.queryByRole('textbox', { name: /^BIC/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CHF' })).toBeInTheDocument()
    await user.type(field(/^Name/), 'Max Mustermann')
    await user.type(field(/^IBAN/), SAMPLE_IBAN.CH)
    await user.type(field(/^Postcode/), '8001')
    await user.type(field(/^City/), 'Zürich')
    await stable()
    expect(png()).toBeEnabled()
    // payer block is collapsed by default
    const payer = screen.getByRole('button', { name: /Payer \(optional\)/ })
    expect(payer).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('textbox', { name: /^Postcode/ })).toHaveLength(1)
    await user.click(payer)
    await stable()
    expect(payer).toHaveAttribute('aria-expanded', 'true')
    // creditor address is required, the optional payer address is not (until a payer name is set)
    const [zip, payerZip] = screen.getAllByRole('textbox', { name: /^Postcode/ })
    const [city, payerCity] = screen.getAllByRole('textbox', { name: /^City/ })
    expect(zip).toHaveAttribute('aria-required', 'true')
    expect(city).toHaveAttribute('aria-required', 'true')
    expect(payerZip).not.toHaveAttribute('aria-required')
    expect(payerCity).not.toHaveAttribute('aria-required')
    await user.type(screen.getAllByRole('textbox', { name: /^Name/ })[1], 'Anna')
    await stable()
    expect(payerZip).toHaveAttribute('aria-required', 'true')
    expect(png()).toBeDisabled() // payer address now incomplete
  })

  it('makes the reference required for a QR-IBAN', async () => {
    seed(sampleSwiss)
    const { user, stable } = await setup()
    const iban = field(/^IBAN/)
    await user.clear(iban)
    await user.type(iban, 'CH4431999123000889012')
    await stable()
    expect(field(/^Reference/)).toHaveAttribute('aria-required', 'true')
    expect(screen.getByText(/requires a 27-digit QR reference/)).toBeInTheDocument()
    await user.type(field(/^Reference/), '210000000003139471430009017')
    await stable()
    expect(png()).toBeEnabled()
  })

  it('translates the UI to German', async () => {
    const { user, stable } = await setup()
    await user.click(screen.getByRole('button', { name: 'DE' }))
    await stable()
    expect(screen.getByRole('button', { name: 'Zahlungscode' })).toBeInTheDocument()
    expect(field(/^Verwendungszweck/)).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('de')
    expect(localStorage.getItem('lang')).toBe('de')
  })

  it('validates EAN-13 digits in barcode mode', async () => {
    const { user, stable } = await setup()
    await user.click(screen.getByRole('button', { name: 'Barcode' }))
    await stable()
    await user.click(screen.getByRole('button', { name: 'EAN-13' }))
    await stable()
    const content = field(/^Content/)
    expect(content).toHaveAttribute('aria-required', 'true')
    expect(content).toHaveValue('')
    expect(content).toHaveAttribute('placeholder', '4006381333931')
    await user.type(content, '12345')
    await stable()
    expect(screen.getByText('Needs 12/13 digits')).toBeInTheDocument()
    expect(png()).toBeDisabled()
  })

  it('keeps state in the URL so links restore it', async () => {
    const { user, view, stable } = await setup()
    await user.type(field(/^Name/), 'Shared GmbH')
    await stable()
    view.fixture.destroy()
    TestBed.resetTestingModule()
    await setup()
    expect(field(/^Name/)).toHaveValue('Shared GmbH')
  })

  it('adds exports to the recent list and restores them', async () => {
    HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,'
    HTMLCanvasElement.prototype.getContext = (() => ({ drawImage() {} })) as never
    HTMLAnchorElement.prototype.click = vi.fn()
    seed()
    const { user, stable } = await setup()
    await user.click(png())
    await stable()
    const recent = screen.getByRole('heading', { name: 'Recent' }).closest('div')!.parentElement!
    expect(within(recent).getByText(/Max Mustermann · 49,90 EUR/)).toBeInTheDocument()

    await user.clear(field(/^Name/))
    await user.type(field(/^Name/), 'Other')
    await user.click(within(recent).getByRole('button', { name: /Max Mustermann/ }))
    await stable()
    expect(field(/^Name/)).toHaveValue('Max Mustermann')
  })

  it('shows the timestamped purpose as a placeholder', async () => {
    await setup()
    const purpose = field(/^Purpose/)
    expect(purpose).toHaveValue('')
    expect(purpose.getAttribute('placeholder')).toMatch(/^Rechnung \d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}$/)
  })

  it('keeps payer data when collapsed and flags it if incomplete', async () => {
    const { user, stable } = await setup()
    await user.click(screen.getByRole('button', { name: /Switzerland/ }))
    await stable()
    const payer = screen.getByRole('button', { name: /Payer \(optional\)/ })
    await user.click(payer)
    await stable()
    await user.type(screen.getAllByRole('textbox', { name: /^Name/ })[1], 'Anna Muster')
    await user.click(payer)
    await stable()
    expect(payer).toHaveTextContent('Anna Muster')
    expect(screen.getByLabelText('Incomplete')).toBeInTheDocument()
    expect(png()).toBeDisabled()
  })

  it('loads a different link pasted into the same tab', async () => {
    const { user, stable } = await setup()
    await user.type(field(/^Name/), 'Link A')
    await stable()
    const linkA = location.hash
    await user.clear(field(/^Name/))
    await user.type(field(/^Name/), 'Link B')
    await stable()
    location.hash = linkA
    await screen.findByDisplayValue('Link A')
  })

  it('opens the legal pages from the footer and keeps the form on back', async () => {
    const { user, stable } = await setup()
    await user.type(field(/^Name/), 'Keep me')
    await stable()
    const formHash = location.hash

    await user.click(screen.getByRole('link', { name: 'Legal notice' }))
    expect(await screen.findByRole('heading', { name: 'Legal notice' })).toBeInTheDocument()
    expect(location.hash).toBe('#impressum')

    await user.click(screen.getByRole('link', { name: 'Privacy' }))
    expect(await screen.findByRole('heading', { name: 'Privacy policy' })).toBeInTheDocument()

    location.hash = formHash
    expect(await screen.findByDisplayValue('Keep me')).toBeInTheDocument()
  })

  it('opens a legal page from a direct link', async () => {
    history.replaceState(null, '', '/#datenschutz')
    await setup()
    expect(screen.getByRole('heading', { name: 'Privacy policy' })).toBeInTheDocument()
    expect(location.hash).toBe('#datenschutz')
  })

  it('back from a direct legal link goes to the form, not off the site', async () => {
    history.replaceState(null, '', '/#impressum')
    const { user } = await setup()
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(await screen.findByRole('textbox', { name: /^Name/ })).toBeInTheDocument()
    expect(location.hash).toMatch(/^#s=/)
  })

  it('copies the share link, and offers it by hand when copying fails', async () => {
    const { user } = await setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    await user.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(writeText).toHaveBeenCalledWith(location.href)
    expect(await screen.findByText('Link copied')).toBeInTheDocument()

    writeText.mockRejectedValueOnce(new Error('NotAllowedError'))
    document.execCommand = vi.fn().mockReturnValue(false)
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null)
    await user.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(prompt).toHaveBeenCalledWith('Copy link', location.href)
    expect(await screen.findByText('Copy failed')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('hides the image copy button where the browser cannot copy images', async () => {
    await setup()
    expect(screen.queryByRole('button', { name: /^copy$/i })).toBeNull()
    expect(png()).toBeInTheDocument()
  })

  it('explains that the Swiss output is the QR code only', async () => {
    const { user, stable } = await setup()
    expect(screen.queryByText(/Swiss QR code only/)).toBeNull()
    await user.click(screen.getByRole('button', { name: /Switzerland/ }))
    await stable()
    expect(screen.getByText(/Swiss QR code only/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Germany/ }))
    await stable()
    expect(screen.queryByText(/Swiss QR code only/)).toBeNull()
  })
})
