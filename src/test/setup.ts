import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// Only DOM test files need cleanup; scan tests run in plain Node.
if (typeof window !== 'undefined') {
  afterEach(() => {
    localStorage.clear()
    history.replaceState(null, '', '/')
  })
}
