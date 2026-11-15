import { Component, type ReactNode } from 'react'
import { detectLang } from '../i18n'

const text = {
  en: { title: 'Something went wrong', body: 'This link may be broken. Start again with a fresh form.', reset: 'Start over' },
  de: { title: 'Etwas ist schiefgelaufen', body: 'Dieser Link ist möglicherweise defekt. Beginne mit einem leeren Formular.', reset: 'Neu starten' },
}

/** Last line of defence: never show a white screen, always offer a way back. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  reset = () => {
    history.replaceState(null, '', location.pathname)
    this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    const t = text[detectLang()]
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">{t.title}</h1>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400">{t.body}</p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-6 rounded-full bg-mint-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-mint-600"
          >
            {t.reset}
          </button>
        </div>
      </div>
    )
  }
}
