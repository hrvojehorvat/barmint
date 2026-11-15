import { Check, Leaf, Link2, Lock, ScanBarcode, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BarcodeForm } from './components/BarcodeForm'
import { History } from './components/History'
import { Legal, legalPageFromHash, type LegalPage } from './components/Legal'
import { PaymentForm } from './components/PaymentForm'
import { Preview } from './components/Preview'
import { Card, Segmented } from './components/ui'
import { detectLang, dicts, type Lang } from './i18n'
import { FORMATS, validateBarcode } from './lib/barcode'
import { copyText } from './lib/clipboard'
import { barcodeOptions, paymentOptions } from './lib/options'
import { autoPurpose, buildPayment, parseAmount } from './lib/payment'
import type { RenderOptions } from './lib/render'
import {
  loadHistory,
  pushHistory,
  readUrlState,
  saveHistory,
  writeUrlState,
  type AppState,
  type HistoryItem,
  type Mode,
} from './lib/storage'

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang)
  const [state, setState] = useState<AppState>(readUrlState)
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)
  const [linkCopied, setLinkCopied] = useState<'ok' | 'fail' | null>(null)
  const [page, setPage] = useState<LegalPage | null>(() => legalPageFromHash(location.hash))
  // True once the user navigated to a legal page from within the app, so "back" stays on BarMint.
  const navigatedInApp = useRef(false)
  const leaveLegal = () => {
    if (navigatedInApp.current) return window.history.back()
    window.history.replaceState(null, '', location.pathname)
    setPage(null)
  }
  const t = dicts[lang]
  const { mode, payment, barcode } = state

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  // On a legal page the fragment is #impressum / #datenschutz; the form state is restored on "back".
  useEffect(() => {
    if (!page) writeUrlState(state)
  }, [state, page])
  // Pasting another BarMint link into the same tab only changes the #fragment (no reload).
  useEffect(() => {
    const onHash = () => {
      const p = legalPageFromHash(location.hash)
      if (p) navigatedInApp.current = true
      setPage(p)
      if (!p) setState(readUrlState())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => saveHistory(history), [history])

  // Fixed per page load so the code doesn't change every second.
  const [purpose] = useState(() => autoPurpose())
  const pay = useMemo(() => buildPayment(payment, purpose), [payment, purpose])
  const barcodeErrors = useMemo(() => validateBarcode(barcode), [barcode])

  const opts = useMemo<RenderOptions | null>(() => {
    if (mode === 'payment') return paymentOptions(pay)
    return Object.keys(barcodeErrors).length ? null : barcodeOptions(barcode)
  }, [mode, pay, barcode, barcodeErrors])

  const label =
    mode === 'payment'
      ? [payment.name.trim(), parseAmount(payment.amount) ? `${payment.amount.trim()} ${payment.currency}` : '']
          .filter(Boolean)
          .join(' · ')
      : `${FORMATS.find((f) => f.id === barcode.format)!.label} · ${barcode.text.trim()}`

  const filename =
    mode === 'payment'
      ? pay.standard === 'swiss'
        ? 'swiss-qr-bill'
        : 'girocode'
      : `${barcode.format}-${barcode.text
          .trim()
          .replace(/[^\w-]+/g, '_')
          .slice(0, 40)}`

  const setMode = (m: Mode) => setState((s) => ({ ...s, mode: m }))

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-mint-300/45 via-teal-200/25 to-transparent dark:from-mint-500/25 dark:via-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-gradient-to-tl from-mint-200/50 to-transparent dark:from-mint-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-mint-300 to-mint-600 text-white shadow-[0_4px_14px_-4px_rgba(31,174,136,0.7)]">
              <ScanBarcode className="h-4.5 w-4.5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-neutral-900 ring-1 ring-mint-200 dark:ring-mint-700">
                <Leaf className="h-2.5 w-2.5 text-mint-500" strokeWidth={2.5} />
              </span>
            </span>
            <span className="text-[17px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              Bar<span className="text-mint-500">Mint</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const ok = await copyText(location.href)
                // Last resort: show the link so it can be copied by hand.
                if (!ok) window.prompt(t.share, location.href)
                setLinkCopied(ok ? 'ok' : 'fail')
                setTimeout(() => setLinkCopied(null), 1500)
              }}
              aria-label={t.share}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10"
            >
              {linkCopied === 'ok' ? (
                <Check className="h-3.5 w-3.5 text-mint-500" />
              ) : linkCopied === 'fail' ? (
                <X className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline" aria-live="polite">
                {linkCopied === 'ok' ? t.linkCopied : linkCopied === 'fail' ? t.copyFailed : t.share}
              </span>
            </button>
            <Segmented
              size="sm"
              value={lang}
              onChange={setLang}
              options={[
                { value: 'de', label: 'DE' },
                { value: 'en', label: 'EN' },
              ]}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        {page ? (
          <Legal page={page} lang={lang} onBack={leaveLegal} />
        ) : (
          <>
            <section className="pt-14 pb-10 text-center">
              <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
                {t.heroTitle}
                <br />
                <span className="bg-gradient-to-r from-mint-600 via-mint-400 to-teal-400 bg-clip-text text-transparent">
                  {t.heroAccent}
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {t.heroSub}
              </p>
              <div className="mt-8">
                <Segmented
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: 'payment', label: t.modes.payment },
                    { value: 'barcode', label: t.modes.barcode },
                  ]}
                />
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
              <Card className="p-6 sm:p-8">
                {mode === 'payment' ? (
                  <PaymentForm
                    data={payment}
                    errors={pay.errors}
                    autoPurpose={purpose}
                    onChange={(p) => setState((s) => ({ ...s, payment: p }))}
                    t={t}
                  />
                ) : (
                  <BarcodeForm
                    data={barcode}
                    errors={barcodeErrors}
                    onChange={(b) => setState((s) => ({ ...s, barcode: b }))}
                    t={t}
                  />
                )}
              </Card>

              <div className="space-y-6 lg:sticky lg:top-20">
                <Preview
                  opts={opts}
                  filename={filename}
                  caption={mode === 'payment' ? t.standards[payment.country] : undefined}
                  onExport={(thumb) =>
                    setHistory((h) =>
                      pushHistory(h, {
                        label: label || t.appName,
                        thumb,
                        state,
                      }),
                    )
                  }
                  t={t}
                />
                <History items={history} onPick={(i) => setState(i.state)} onClear={() => setHistory([])} t={t} />
              </div>
            </div>
          </>
        )}

        <footer className="mt-16 flex flex-col items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" /> {t.footer}
          </span>
          <nav className="flex gap-4">
            <a href="#impressum" className="hover:text-mint-600">
              {t.legal.impressum}
            </a>
            <a href="#datenschutz" className="hover:text-mint-600">
              {t.legal.privacy}
            </a>
          </nav>
        </footer>
      </main>
    </div>
  )
}
