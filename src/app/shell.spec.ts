import { ErrorHandler } from '@angular/core'
import { Router } from '@angular/router'
import { TestBed } from '@angular/core/testing'
import { render, screen } from '@testing-library/angular'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { appConfig } from './app.config'
import { CANVAS_RENDERER } from './barmint/canvas-renderer'
import { Shell } from './shell'

/** The real app (router, error handler) opened at `url`. */
const open = async (url: string) => {
  history.replaceState(null, '', url)
  const view = await render(Shell, {
    providers: [...appConfig.providers, { provide: CANVAS_RENDERER, useValue: () => {} }],
  })
  await TestBed.inject(Router).navigateByUrl(url)
  await view.fixture.whenStable()
  return view
}

describe('Shell', () => {
  it('shows the portfolio home with the project list', async () => {
    await open('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Software development and AI/)
    expect(screen.getByRole('link', { name: /BarMint/ })).toHaveAttribute('href', '/barmint')
    expect(document.title).toBe('Mrvoje · Software development & AI')
    expect(screen.getByRole('link', { name: 'Mrvoje (home)' })).toHaveAttribute('href', '/')
  })

  it('navigates to the projects page and into BarMint', async () => {
    const user = userEvent.setup()
    const view = await open('/')
    await user.click(screen.getByRole('link', { name: 'Projects' }))
    expect(await screen.findByRole('heading', { name: 'Projects', level: 1 })).toBeInTheDocument()
    // TestBed uses a mock browser location, so check the router's URL.
    expect(TestBed.inject(Router).url).toBe('/projects')

    await user.click(screen.getByRole('link', { name: /BarMint/ }))
    expect(await screen.findByText('Mint')).toBeInTheDocument()
    await view.fixture.whenStable()
    expect(TestBed.inject(Router).url).toBe('/barmint')
    expect(location.hash).toMatch(/^#s=/)
  })

  it('shows a recovery screen instead of a blank page and resets the link', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const view = await open('/barmint#s=boom')
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
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
