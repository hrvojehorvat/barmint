import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

// jsdom has no canvas; rendering itself is covered by scan.test.ts.
vi.mock('./lib/render', async (orig) => ({
  ...(await orig<typeof import('./lib/render')>()),
  renderCanvas: vi.fn(),
}))

const field = (name: RegExp) => screen.getByRole('textbox', { name })
const png = () => screen.getByRole('button', { name: /png/i })

beforeEach(() => localStorage.setItem('lang', 'en'))

describe('BarMint app', () => {
  it('shows the brand', () => {
    render(<App />)
    expect(screen.getByText('Mint')).toBeInTheDocument()
  })

  it('marks required fields in the payment form', () => {
    render(<App />)
    expect(field(/^Name/)).toHaveAttribute('aria-required', 'true')
    expect(field(/^IBAN/)).toHaveAttribute('aria-required', 'true')
    expect(field(/^BIC/)).not.toHaveAttribute('aria-required')
    expect(field(/^Amount/)).not.toHaveAttribute('aria-required')
  })

  it('renders a valid sample and enables export', () => {
    render(<App />)
    expect(png()).toBeEnabled()
  })

  it('shows an IBAN error immediately and disables export', async () => {
    const user = userEvent.setup()
    render(<App />)
    const iban = field(/^IBAN/)
    await user.clear(iban)
    await user.type(iban, 'DE89370400440532013001')
    expect(iban).toHaveValue('DE89 3704 0044 0532 0130 01')
    expect(screen.getByText('Invalid IBAN')).toBeInTheDocument()
    expect(iban).toHaveAttribute('aria-invalid', 'true')
    expect(png()).toBeDisabled()
  })

  it('shows "Required" only after leaving an emptied field', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.clear(field(/^Name/))
    expect(screen.queryByText('Required')).not.toBeInTheDocument()
    await user.tab()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('switches to Swiss QR-bill with address fields and CHF', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Switzerland/ }))
    expect(field(/^IBAN/)).toHaveValue('CH93 0076 2011 6238 5295 7')
    expect(screen.queryByRole('textbox', { name: /^BIC/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CHF' })).toBeInTheDocument()
    expect(png()).toBeEnabled()
    // payer block is collapsed by default
    const payer = screen.getByRole('button', { name: /Payer \(optional\)/ })
    expect(payer).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('textbox', { name: /^Postcode/ })).toHaveLength(1)
    await user.click(payer)
    expect(payer).toHaveAttribute('aria-expanded', 'true')
    // creditor address is required, the optional payer address is not (until a payer name is set)
    const [zip, payerZip] = screen.getAllByRole('textbox', { name: /^Postcode/ })
    const [city, payerCity] = screen.getAllByRole('textbox', { name: /^City/ })
    expect(zip).toHaveAttribute('aria-required', 'true')
    expect(city).toHaveAttribute('aria-required', 'true')
    expect(payerZip).not.toHaveAttribute('aria-required')
    expect(payerCity).not.toHaveAttribute('aria-required')
    await user.type(screen.getAllByRole('textbox', { name: /^Name/ })[1], 'Anna')
    expect(payerZip).toHaveAttribute('aria-required', 'true')
    expect(png()).toBeDisabled() // payer address now incomplete
  })

  it('makes the reference required for a QR-IBAN', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Switzerland/ }))
    const iban = field(/^IBAN/)
    await user.clear(iban)
    await user.type(iban, 'CH4431999123000889012')
    expect(field(/^Reference/)).toHaveAttribute('aria-required', 'true')
    expect(screen.getByText(/requires a 27-digit QR reference/)).toBeInTheDocument()
    await user.type(field(/^Reference/), '210000000003139471430009017')
    expect(png()).toBeEnabled()
  })

  it('translates the UI to German', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'DE' }))
    expect(screen.getByRole('button', { name: 'Zahlungscode' })).toBeInTheDocument()
    expect(field(/^Verwendungszweck/)).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('de')
    expect(localStorage.getItem('lang')).toBe('de')
  })

  it('validates EAN-13 digits in barcode mode', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Barcode' }))
    await user.click(screen.getByRole('button', { name: 'EAN-13' }))
    const content = field(/^Content/)
    expect(content).toHaveAttribute('aria-required', 'true')
    expect(content).toHaveValue('4006381333931')
    await user.clear(content)
    await user.type(content, '12345')
    expect(screen.getByText('Needs 12/13 digits')).toBeInTheDocument()
    expect(png()).toBeDisabled()
  })

  it('keeps state in the URL so links restore it', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.clear(field(/^Name/))
    await user.type(field(/^Name/), 'Shared GmbH')
    unmount()
    render(<App />)
    expect(field(/^Name/)).toHaveValue('Shared GmbH')
  })

  it('adds exports to the recent list and restores them', async () => {
    const user = userEvent.setup()
    HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,'
    HTMLCanvasElement.prototype.getContext = (() => ({ drawImage() {} })) as never
    HTMLAnchorElement.prototype.click = vi.fn()
    render(<App />)
    await user.click(png())
    const recent = screen.getByRole('heading', { name: 'Recent' }).closest('div')!.parentElement!
    expect(within(recent).getByText(/Max Mustermann · 49,90 EUR/)).toBeInTheDocument()

    await user.clear(field(/^Name/))
    await user.type(field(/^Name/), 'Other')
    await user.click(within(recent).getByRole('button', { name: /Max Mustermann/ }))
    expect(field(/^Name/)).toHaveValue('Max Mustermann')
  })

  it('shows the timestamped purpose as a placeholder', () => {
    render(<App />)
    const purpose = field(/^Purpose/)
    expect(purpose).toHaveValue('')
    expect(purpose.getAttribute('placeholder')).toMatch(/^Rechnung \d{4}-\d{2}-\d{2}:\d{2}:\d{2}:\d{2}$/)
  })

  it('keeps payer data when collapsed and flags it if incomplete', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Switzerland/ }))
    const payer = screen.getByRole('button', { name: /Payer \(optional\)/ })
    await user.click(payer)
    await user.type(screen.getAllByRole('textbox', { name: /^Name/ })[1], 'Anna Muster')
    await user.click(payer)
    expect(payer).toHaveTextContent('Anna Muster')
    expect(screen.getByLabelText('Incomplete')).toBeInTheDocument()
    expect(png()).toBeDisabled()
  })

  it('loads a different link pasted into the same tab', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.clear(field(/^Name/))
    await user.type(field(/^Name/), 'Link A')
    const linkA = location.hash
    await user.clear(field(/^Name/))
    await user.type(field(/^Name/), 'Link B')
    location.hash = linkA
    await screen.findByDisplayValue('Link A')
  })

  it('opens the legal pages from the footer and keeps the form on back', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.clear(field(/^Name/))
    await user.type(field(/^Name/), 'Keep me')
    const formHash = location.hash

    await user.click(screen.getByRole('link', { name: 'Legal notice' }))
    expect(await screen.findByRole('heading', { name: 'Legal notice' })).toBeInTheDocument()
    expect(location.hash).toBe('#impressum')

    await user.click(screen.getByRole('link', { name: 'Privacy' }))
    expect(await screen.findByRole('heading', { name: 'Privacy policy' })).toBeInTheDocument()

    location.hash = formHash
    expect(await screen.findByDisplayValue('Keep me')).toBeInTheDocument()
  })

  it('opens a legal page from a direct link', () => {
    history.replaceState(null, '', '/#datenschutz')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Privacy policy' })).toBeInTheDocument()
    expect(location.hash).toBe('#datenschutz')
  })

  it('back from a direct legal link goes to the form, not off the site', async () => {
    history.replaceState(null, '', '/#impressum')
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(await screen.findByRole('textbox', { name: /^Name/ })).toBeInTheDocument()
    expect(location.hash).toMatch(/^#s=/)
  })
})
