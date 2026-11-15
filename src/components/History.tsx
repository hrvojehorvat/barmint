import type { Dict } from '../i18n'
import type { HistoryItem } from '../lib/storage'
import { Card } from './ui'

interface Props {
  items: HistoryItem[]
  onPick: (i: HistoryItem) => void
  onClear: () => void
  t: Dict
}

export function History({ items, onPick, onClear, t }: Props) {
  if (!items.length) return null
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{t.history}</h2>
        <button type="button" onClick={onClear} className="text-xs font-medium text-mint-600 dark:text-mint-400 hover:underline">
          {t.clear}
        </button>
      </div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => onPick(i)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-black/5 p-1">
                <img src={i.thumb} alt="" className="max-h-full max-w-full" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{i.label}</span>
                <span className="block text-xs text-neutral-400">{new Date(i.ts).toLocaleString()}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
