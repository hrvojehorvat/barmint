import type { InputHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import type { FieldError } from '../lib/payment'
import type { Dict } from '../i18n'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'rounded-[28px] bg-white/75 dark:bg-white/[0.06] backdrop-blur-2xl',
        'ring-1 ring-black/[0.06] dark:ring-white/10',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
  size?: 'sm' | 'md'
}) {
  return (
    <div className="inline-flex rounded-full bg-black/[0.06] dark:bg-white/10 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            'rounded-full font-medium transition-all duration-200',
            size === 'sm' ? 'px-3 py-1 text-xs' : 'px-5 py-2 text-sm',
            value === o.value
              ? 'bg-white dark:bg-white/20 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400 dark:text-neutral-500 mb-3">
      {children}
    </h3>
  )
}

export const inputClass = (error?: boolean) =>
  cx(
    'w-full rounded-xl px-4 py-3 text-[15px] outline-none transition',
    'bg-black/[0.04] dark:bg-white/[0.07] text-neutral-900 dark:text-white placeholder:text-neutral-400',
    'ring-1 focus:bg-white dark:focus:bg-white/10 focus:ring-2',
    error ? 'ring-red-500/70 focus:ring-red-500' : 'ring-transparent focus:ring-mint-500',
  )

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string
  value: string
  onChange: (v: string) => void
  error?: FieldError
  hint?: string
  t: Dict
  className?: string
}

export function Field({ label, value, onChange, error, hint, t, className, mono, required, ...rest }: FieldProps & { mono?: boolean }) {
  const [touched, setTouched] = useState(false)
  // "required" errors only appear after the field was left once; format errors show immediately.
  const shown = error && (error.key !== 'required' || touched) ? error : undefined
  const msg = shown && t.errors[shown.key].replace('{n}', String(shown.n ?? ''))
  return (
    <label className={cx('block', className)}>
      <span className="block text-[13px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5 ml-1">
        {label}
        {required && (
          <span className="ml-0.5 text-mint-600 dark:text-mint-400" aria-hidden>
            *
          </span>
        )}
      </span>
      <input
        {...rest}
        aria-required={required || undefined}
        aria-invalid={!!shown || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        className={cx(inputClass(!!shown), mono && 'font-mono tracking-wide')}
      />
      <span
        className={cx(
          'block text-xs mt-1.5 ml-1 min-h-4',
          shown ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500',
        )}
      >
        {msg || hint}
      </span>
    </label>
  )
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition active:scale-[0.97]',
        'disabled:opacity-40 disabled:pointer-events-none',
        variant === 'primary'
          ? 'bg-mint-500 text-white hover:bg-mint-600 shadow-[0_6px_20px_-6px_rgba(31,174,136,0.6)]'
          : 'bg-black/[0.06] dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/15',
      )}
    >
      {children}
    </button>
  )
}
