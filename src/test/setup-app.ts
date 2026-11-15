import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// jsdom doesn't implement scrolling.
window.scrollTo = () => {}

afterEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/')
})
