import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted font: no requests to Google (GDPR).
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
