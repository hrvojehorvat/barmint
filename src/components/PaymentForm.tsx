import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Dict } from '../i18n'
import { SAMPLE_IBAN, group4, type Country, type Errors, type PaymentData } from '../lib/payment'
import { Field, Segmented, SectionTitle, cx } from './ui'

const COUNTRIES: Country[] = ['DE', 'AT', 'CH']

interface Props {
  data: PaymentData
  errors: Errors<PaymentData>
  onChange: (d: PaymentData) => void
  autoPurpose: string
  t: Dict
}

export function PaymentForm({ data, errors, onChange, autoPurpose, t }: Props) {
  const set = <K extends keyof PaymentData>(k: K, v: PaymentData[K]) => onChange({ ...data, [k]: v })
  const swiss = data.country === 'CH'
  const f = (k: keyof PaymentData & keyof Dict['f']) => ({
    label: t.f[k],
    value: data[k] as string,
    onChange: (v: string) => set(k, v),
    error: errors[k],
    t,
  })

  const pickCountry = (c: Country) => {
    const currency = c !== 'CH' ? 'EUR' : data.country === 'CH' ? data.currency : 'CHF'
    // Swap in the sample IBAN for the new country if the user hasn't entered their own yet.
    const cur = group4(data.iban)
    const iban = !cur || Object.values(SAMPLE_IBAN).includes(cur) ? SAMPLE_IBAN[c] : data.iban
    onChange({ ...data, country: c, currency, iban })
  }

  const qrIban = swiss && /^(CH|LI)\d{2}3[01]/.test(data.iban.replace(/\s/g, '').toUpperCase())
  const refHint = swiss ? (qrIban ? t.hints.refQrr : t.hints.refScor) : t.hints.refEpc
  const hasDebtor = !!data.dName.trim()
  // Payer block is optional: collapsed unless it already has data (e.g. restored from a link).
  const [payerOpen, setPayerOpen] = useState(hasDebtor)
  const payerErrors = (['dName', 'dStreet', 'dHouseNo', 'dZip', 'dCity', 'dCountry'] as const).some((k) => errors[k])

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>{t.country}</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {COUNTRIES.map((c) => {
            const active = data.country === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => pickCountry(c)}
                className={cx(
                  'relative text-left rounded-2xl p-4 transition-all duration-200',
                  active
                    ? 'bg-white dark:bg-white/10 ring-2 ring-mint-500 shadow-[0_8px_24px_-10px_rgba(31,174,136,0.5)]'
                    : 'bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/5 dark:ring-white/10 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]',
                )}
              >
                <span className="flex items-center justify-between">
                  <span
                    className={cx(
                      'inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                      active ? 'bg-mint-500 text-white' : 'bg-black/[0.06] dark:bg-white/10 text-neutral-600 dark:text-neutral-300',
                    )}
                  >
                    {c}
                  </span>
                  {active && <Check className="h-4 w-4 text-mint-500" />}
                </span>
                <span className="block mt-3 text-sm font-semibold text-neutral-900 dark:text-white">{t.countries[c]}</span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                  {t.standards[c]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <SectionTitle>{t.sections.recipient}</SectionTitle>
        <div className="grid grid-cols-6 gap-x-3 gap-y-1">
          <Field {...f('name')} required className="col-span-6" autoComplete="organization" />
          <Field
            {...f('iban')}
            required
            onChange={(v) => set('iban', group4(v))}
            className={swiss ? 'col-span-6' : 'col-span-6 sm:col-span-4'}
            mono
            spellCheck={false}
            placeholder="DE00 0000 0000 0000 0000 00"
          />
          {!swiss && (
            <Field
              {...f('bic')}
              onChange={(v) => set('bic', v.toUpperCase())}
              className="col-span-6 sm:col-span-2"
              hint={t.hints.optional}
              mono
              spellCheck={false}
            />
          )}
          {swiss && (
            <>
              <Field {...f('street')} className="col-span-4" autoComplete="address-line1" />
              <Field {...f('houseNo')} className="col-span-2" />
              <Field {...f('zip')} required className="col-span-2" autoComplete="postal-code" />
              <Field {...f('city')} required className="col-span-4" autoComplete="address-level2" />
            </>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>{t.sections.payment}</SectionTitle>
        <div className="grid grid-cols-6 gap-x-3 gap-y-1">
          <Field {...f('amount')} className="col-span-4" inputMode="decimal" placeholder="0,00" hint={t.hints.amount} />
          <div className="col-span-2">
            <span className="block text-[13px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 ml-1">
              {t.f.currency}
            </span>
            <div className="h-[46px] flex items-center">
              {swiss ? (
                <Segmented
                  size="sm"
                  value={data.currency}
                  onChange={(v) => set('currency', v)}
                  options={[
                    { value: 'CHF', label: 'CHF' },
                    { value: 'EUR', label: 'EUR' },
                  ]}
                />
              ) : (
                <span className="px-4 text-[15px] font-medium text-neutral-500">EUR</span>
              )}
            </div>
          </div>
          <Field
            {...f('reference')}
            required={qrIban}
            onChange={(v) => set('reference', v.toUpperCase())}
            className="col-span-6"
            hint={refHint}
            mono
            spellCheck={false}
          />
          <Field
            {...f('message')}
            className="col-span-6"
            placeholder={data.reference.trim() ? '' : autoPurpose}
            hint={t.hints.message}
            maxLength={140}
          />
        </div>
      </div>

      {swiss && (
        <div className="rounded-2xl ring-1 ring-black/[0.06] dark:ring-white/10">
          <button
            type="button"
            onClick={() => setPayerOpen((o) => !o)}
            aria-expanded={payerOpen}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100">{t.sections.payer}</span>
              <span className="block truncate text-xs text-neutral-400 dark:text-neutral-500">
                {!payerOpen && hasDebtor
                  ? [data.dName, data.dZip, data.dCity].filter((x) => x.trim()).join(' · ')
                  : t.hints.payer}
              </span>
            </span>
            {!payerOpen && payerErrors && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-label={t.hints.incomplete} />}
            <ChevronDown
              className={cx('h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200', payerOpen && 'rotate-180')}
            />
          </button>
          {payerOpen && (
          <div className="grid grid-cols-6 gap-x-3 gap-y-1 px-4 pb-3 pt-1 animate-[fadeIn_200ms_ease-out]">
            <Field label={t.f.name} value={data.dName} onChange={(v) => set('dName', v)} error={errors.dName} t={t} className="col-span-6" />
            <Field label={t.f.street} value={data.dStreet} onChange={(v) => set('dStreet', v)} error={errors.dStreet} t={t} className="col-span-4" />
            <Field label={t.f.houseNo} value={data.dHouseNo} onChange={(v) => set('dHouseNo', v)} error={errors.dHouseNo} t={t} className="col-span-2" />
            <Field label={t.f.zip} value={data.dZip} onChange={(v) => set('dZip', v)} error={errors.dZip} t={t} required={hasDebtor} className="col-span-2" />
            <Field label={t.f.city} value={data.dCity} onChange={(v) => set('dCity', v)} error={errors.dCity} t={t} required={hasDebtor} className="col-span-3" />
            <Field
              label={t.f.dCountry}
              value={data.dCountry}
              onChange={(v) => set('dCountry', v.toUpperCase())}
              error={errors.dCountry}
              required={hasDebtor}
              t={t}
              className="col-span-1"
              maxLength={2}
            />
          </div>
          )}
        </div>
      )}
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        <span className="text-mint-600 dark:text-mint-400">*</span> {t.requiredNote}
      </p>
    </div>
  )
}
