import { ChangeDetectionStrategy, Component, type OnInit, computed, input, output, signal } from '@angular/core'
import { LucideCheck, LucideChevronDown } from '@lucide/angular'
import type { Dict } from '../../../i18n'
import { SAMPLE_IBAN, group4, type Country, type Errors, type PaymentData } from '../../../lib/payment'
import { SectionTitle } from '../../ui/card'
import { cx } from '../../ui/cx'
import { Field } from '../../ui/field'
import { Segmented } from '../../ui/segmented'

const PAYER_KEYS = ['dName', 'dStreet', 'dHouseNo', 'dZip', 'dCity', 'dCountry'] as const

@Component({
  selector: 'app-payment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Field, Segmented, SectionTitle, LucideCheck, LucideChevronDown],
  templateUrl: './payment-form.html',
  host: { class: 'block space-y-8' },
})
export class PaymentForm implements OnInit {
  readonly data = input.required<PaymentData>()
  readonly errors = input.required<Errors<PaymentData>>()
  readonly autoPurpose = input.required<string>()
  readonly t = input.required<Dict>()
  readonly changed = output<PaymentData>()

  protected readonly countries: Country[] = ['DE', 'AT', 'CH']
  protected readonly sampleIban = SAMPLE_IBAN
  protected readonly group4 = group4
  protected readonly upper = (v: string) => v.toUpperCase()
  protected readonly currencies = [
    { value: 'CHF' as const, label: 'CHF' },
    { value: 'EUR' as const, label: 'EUR' },
  ]

  protected readonly swiss = computed(() => this.data().country === 'CH')
  protected readonly qrIban = computed(
    () => this.swiss() && /^(CH|LI)\d{2}3[01]/.test(this.data().iban.replace(/\s/g, '').toUpperCase()),
  )
  protected readonly refHint = computed(() => {
    const h = this.t().hints
    return this.swiss() ? (this.qrIban() ? h.refQrr : h.refScor) : h.refEpc
  })
  protected readonly hasDebtor = computed(() => !!this.data().dName.trim())
  protected readonly payerErrors = computed(() => PAYER_KEYS.some((k) => this.errors()[k]))
  protected readonly payerSummary = computed(() => {
    const d = this.data()
    return [d.dName, d.dZip, d.dCity].filter((x) => x.trim()).join(' · ')
  })
  // Payer block is optional: collapsed unless it already has data (e.g. restored from a link).
  protected readonly payerOpen = signal(false)

  ngOnInit() {
    this.payerOpen.set(this.hasDebtor())
  }

  protected set<K extends keyof PaymentData>(k: K, v: PaymentData[K]) {
    this.changed.emit({ ...this.data(), [k]: v })
  }

  protected pickCountry(c: Country) {
    const d = this.data()
    const currency = c !== 'CH' ? 'EUR' : d.country === 'CH' ? d.currency : 'CHF'
    this.changed.emit({ ...d, country: c, currency })
  }

  protected countryClass(active: boolean) {
    return cx(
      'relative text-left rounded-2xl p-4 transition-all duration-200',
      active
        ? 'bg-white dark:bg-white/10 ring-2 ring-mint-500 shadow-[0_8px_24px_-10px_rgba(31,174,136,0.5)]'
        : 'bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/5 dark:ring-white/10 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]',
    )
  }

  protected badgeClass(active: boolean) {
    return cx(
      'inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
      active ? 'bg-mint-500 text-white' : 'bg-black/[0.06] dark:bg-white/10 text-neutral-600 dark:text-neutral-300',
    )
  }
}
