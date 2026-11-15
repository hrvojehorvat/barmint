import { defineConfig } from 'vitest/config'

// Framework-free logic in src/lib (payment payloads, storage, rendering, scanning).
// Angular component tests run separately through `ng test` (src/app/**/*.spec.ts).
export default defineConfig({
  test: {
    include: ['src/lib/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
