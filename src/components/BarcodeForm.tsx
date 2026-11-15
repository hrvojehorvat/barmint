import type { Dict } from '../i18n'
import { FORMATS, SAMPLE_TEXT, type BarcodeData, type Format } from '../lib/barcode'
import type { Errors } from '../lib/payment'
import { Field, SectionTitle, cx } from './ui'

interface Props {
  data: BarcodeData
  errors: Errors<BarcodeData>
  onChange: (d: BarcodeData) => void
  t: Dict
}

export function BarcodeForm({ data, errors, onChange, t }: Props) {
  const set = <K extends keyof BarcodeData>(k: K, v: BarcodeData[K]) => onChange({ ...data, [k]: v })

  const pickFormat = (format: Format) => {
    // Keep the user's text; drop it only if it is an example value (e.g. from an older saved link).
    const isSample = Object.values(SAMPLE_TEXT).includes(data.text)
    onChange({ ...data, format, text: isSample ? '' : data.text })
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>{t.barcode.format}</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => pickFormat(f.id)}
              className={cx(
                'rounded-full px-4 py-2 text-sm font-medium transition',
                data.format === f.id
                  ? 'bg-mint-500 text-white shadow-[0_6px_20px_-8px_rgba(31,174,136,0.7)]'
                  : 'bg-black/[0.05] dark:bg-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-black/10 dark:hover:bg-white/15',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Field
        label={t.barcode.content}
        value={data.text}
        onChange={(v) => set('text', v)}
        error={errors.text}
        required
        t={t}
        mono
        spellCheck={false}
        placeholder={SAMPLE_TEXT[data.format]}
        inputMode={FORMATS.find((f) => f.id === data.format)?.digits ? 'numeric' : 'text'}
      />

      <div className="grid grid-cols-2 gap-4">
        {(['fg', 'bg'] as const).map((k) => (
          <label key={k} className="flex items-center gap-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] p-3 cursor-pointer">
            <input
              type="color"
              value={data[k]}
              onChange={(e) => set(k, e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-black/10 [&::-webkit-color-swatch-wrapper]:p-0"
            />
            <span>
              <span className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-200">{t.barcode[k]}</span>
              <span className="block font-mono text-xs text-neutral-400 uppercase">{data[k]}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="flex justify-between text-[13px] font-medium text-neutral-600 dark:text-neutral-300 mb-2 ml-1">
            {t.barcode.size}
            <span className="font-mono text-neutral-400">{data.scale}×</span>
          </span>
          <input
            type="range"
            min={1}
            max={10}
            value={data.scale}
            onChange={(e) => set('scale', Number(e.target.value))}
            className="w-full accent-mint-500"
          />
        </label>
        {data.format !== 'qrcode' && (
          <label className="flex items-center justify-between ml-1 cursor-pointer">
            <span className="text-[13px] font-medium text-neutral-600 dark:text-neutral-300">{t.barcode.showText}</span>
            <button
              type="button"
              role="switch"
              aria-checked={data.showText}
              onClick={() => set('showText', !data.showText)}
              className={cx(
                'relative h-7 w-12 rounded-full transition-colors',
                data.showText ? 'bg-mint-500' : 'bg-black/15 dark:bg-white/20',
              )}
            >
              <span
                className={cx(
                  'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                  data.showText && 'translate-x-5',
                )}
              />
            </button>
          </label>
        )}
      </div>
    </div>
  )
}
