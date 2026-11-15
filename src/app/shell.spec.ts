import { ErrorHandler } from '@angular/core'
import { render, screen } from '@testing-library/angular'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CANVAS_RENDERER } from './canvas-renderer'
import { RecoveringErrorHandler } from './recovery'
import { Shell } from './shell'

describe('Shell', () => {
  it('shows a recovery screen instead of a blank page and resets the link', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    history.replaceState(null, '', '/#s=boom')
    const view = await render(Shell, {
      providers: [
        { provide: ErrorHandler, useClass: RecoveringErrorHandler },
        { provide: CANVAS_RENDERER, useValue: () => {} },
      ],
    })
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
})
