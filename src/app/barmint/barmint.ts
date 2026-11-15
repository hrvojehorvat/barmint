import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LucideCheck, LucideLink2, LucideLock, LucideX } from '@lucide/angular'
import { detectLang, dicts, type Lang } from '../../i18n'
import { SITE } from '../../site'
import { FORMATS, validateBarcode, type BarcodeData } from '../../lib/barcode'
import { copyText } from '../../lib/clipboard'
import { barcodeOptions, paymentOptions } from '../../lib/options'
import { autoPurpose, buildPayment, parseAmount, type PaymentData } from '../../lib/payment'
import type { RenderOptions } from '../../lib/render'
import {
  loadHistory,
  pushHistory,
  readUrlState,
  saveHistory,
  writeUrlState,
  type AppState,
  type HistoryItem,
  type Mode,
} from '../../lib/storage'
import { BarcodeForm } from './barcode-form/barcode-form'
import { History } from './history/history'
import { BarMintLogo } from './logo'
import { Legal, legalPageFromHash, type LegalPage } from './legal/legal'
import { PaymentForm } from './payment-form/payment-form'
import { Preview } from './preview/preview'
import { Card } from '../ui/card'
import { Segmented } from '../ui/segmented'

@Component({
  selector: 'app-barmint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BarMintLogo,
    BarcodeForm,
    Card,
    History,
    Legal,
    PaymentForm,
    Preview,
    RouterLink,
    Segmented,
    LucideCheck,
    LucideLink2,
    LucideLock,
    LucideX,
  ],
  templateUrl: './barmint.html',
  // theme-mint: BarMint's accent colour for the shared UI (see styles.css).
  host: { class: 'theme-mint relative block min-h-screen overflow-x-hidden bg-[#f3faf7] dark:bg-black' },
})
export class BarMint {
  protected readonly lang = signal<Lang>(detectLang())
  protected readonly state = signal<AppState>(readUrlState())
  protected readonly history = signal<HistoryItem[]>(loadHistory())
  protected readonly linkCopied = signal<'ok' | 'fail' | null>(null)
  protected readonly page = signal<LegalPage | null>(legalPageFromHash(location.hash))
  // True once the user navigated to a legal page from within the app, so "back" stays on BarMint.
  private navigatedInApp = false
  private linkTimer?: ReturnType<typeof setTimeout>

  protected readonly t = computed(() => dicts[this.lang()])
  protected readonly path = location.pathname
  protected readonly author = SITE.name
  protected readonly langs = [
    { value: 'de' as const, label: 'DE' },
    { value: 'en' as const, label: 'EN' },
  ]
  protected readonly modes = computed(() => [
    { value: 'payment' as const, label: this.t().modes.payment },
    { value: 'barcode' as const, label: this.t().modes.barcode },
  ])

  // Fixed per page load so the code doesn't change every second.
  protected readonly purpose = autoPurpose()
  protected readonly pay = computed(() => buildPayment(this.state().payment, this.purpose))
  protected readonly barcodeErrors = computed(() => validateBarcode(this.state().barcode))

  protected readonly opts = computed<RenderOptions | null>(() => {
    const { mode, barcode } = this.state()
    if (mode === 'payment') return paymentOptions(this.pay())
    return Object.keys(this.barcodeErrors()).length ? null : barcodeOptions(barcode)
  })

  private readonly label = computed(() => {
    const { mode, payment, barcode } = this.state()
    return mode === 'payment'
      ? [payment.name.trim(), parseAmount(payment.amount) ? `${payment.amount.trim()} ${payment.currency}` : '']
          .filter(Boolean)
          .join(' · ')
      : `${FORMATS.find((f) => f.id === barcode.format)!.label} · ${barcode.text.trim()}`
  })

  protected readonly filename = computed(() => {
    const { mode, barcode } = this.state()
    if (mode === 'payment') return this.pay().standard === 'swiss' ? 'swiss-qr-bill' : 'girocode'
    return `${barcode.format}-${barcode.text
      .trim()
      .replace(/[^\w-]+/g, '_')
      .slice(0, 40)}`
  })

  constructor() {
    effect(() => {
      const lang = this.lang()
      document.documentElement.lang = lang
      try {
        localStorage.setItem('lang', lang)
      } catch {
        /* ignore */
      }
    })
    // On a legal page the fragment is #impressum / #datenschutz; the form state is restored on "back".
    effect(() => {
      const state = this.state()
      if (!this.page()) writeUrlState(state)
    })
    effect(() => saveHistory(this.history()))

    // Pasting another BarMint link into the same tab only changes the #fragment (no reload).
    const onHash = () => {
      const p = legalPageFromHash(location.hash)
      if (p) this.navigatedInApp = true
      this.page.set(p)
      if (!p) this.state.set(readUrlState())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('hashchange', onHash)
      clearTimeout(this.linkTimer)
    })
  }

  protected setMode(mode: Mode) {
    this.state.update((s) => ({ ...s, mode }))
  }

  protected setPayment(payment: PaymentData) {
    this.state.update((s) => ({ ...s, payment }))
  }

  protected setBarcode(barcode: BarcodeData) {
    this.state.update((s) => ({ ...s, barcode }))
  }

  protected leaveLegal() {
    if (this.navigatedInApp) return window.history.back()
    window.history.replaceState(null, '', location.pathname)
    this.page.set(null)
  }

  protected async copyLink() {
    const ok = await copyText(location.href)
    // Last resort: show the link so it can be copied by hand.
    if (!ok) window.prompt(this.t().share, location.href)
    this.linkCopied.set(ok ? 'ok' : 'fail')
    clearTimeout(this.linkTimer)
    this.linkTimer = setTimeout(() => this.linkCopied.set(null), 1500)
  }

  protected addHistory(thumb: string) {
    const item = { label: this.label() || this.t().appName, thumb, state: this.state() }
    this.history.update((h) => pushHistory(h, item))
  }
}
