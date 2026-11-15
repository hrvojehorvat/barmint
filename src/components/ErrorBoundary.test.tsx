import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb() {
  const [ok] = useState(() => !location.hash.includes('boom'))
  if (!ok) throw new Error('boom')
  return <p>fine</p>
}

describe('ErrorBoundary', () => {
  it('shows a recovery screen instead of a blank page and resets the link', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    history.replaceState(null, '', '/#s=boom')
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(location.hash).toBe('')
    expect(await screen.findByText('fine')).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
