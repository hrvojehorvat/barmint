import { ErrorHandler } from '@angular/core'
import { render, screen } from '@testing-library/angular'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { appConfig } from './app.config'
import { CANVAS_RENDERER } from './canvas-renderer'
import { Shell } from './shell'

/** The real app (error handler) opened at `url`. */
const open = async (url: string) => {
  history.replaceState(null, '', url)
  const view = await render(Shell, {
    providers: [...appConfig.providers, { provide: CANVAS_RENDERER, useValue: () => {} }],
  })
  await view.fixture.whenStable()
  return view
}

describe('Shell', () => {
  it('shows BarMint and keeps the form state in the fragment', async () => {
    const view = await open('/')
    expect(await screen.findByText('Mint')).toBeInTheDocument()
    await view.fixture.whenStable()
    expect(location.hash).toMatch(/^#s=/)
  })

  it('shows a recovery screen instead of a blank page and resets the link', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const view = await open('/#s=boom')
    expect(await screen.findByText('Mint')).toBeInTheDocument()
    view.fixture.debugElement.injector.get(ErrorHandler).handleError(new Error('boom'))
    await view.fixture.whenStable()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /start over/i }))
    expect(await screen.findByText('Mint')).toBeInTheDocument()
    // The broken link is gone; the fresh form writes its own (default) state.
    expect(location.hash).not.toContain('boom')
    expect(screen.getByRole('textbox', { name: /^Name/ })).toHaveValue('')
    vi.restoreAllMocks()
  })

  it('keeps the app running on harmless global browser errors', async () => {
    const view = await open('/')
    window.dispatchEvent(new ErrorEvent('error', { message: 'ResizeObserver loop completed with undelivered notifications' }))
    await view.fixture.whenStable()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(await screen.findByText('Mint')).toBeInTheDocument()
  })
})
