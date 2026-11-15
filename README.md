# BarMint

Client-side generator for payment codes and barcodes for the DACH region. Runs entirely in the browser with no backend.

- **Payment codes:** GiroCode / EPC QR (DE, AT) and Swiss QR-bill (CH), with live IBAN, BIC, amount and reference validation
- **Barcodes:** Code 128, EAN-13, EAN-8, UPC-A, QR
- PNG / SVG export, copy to clipboard, shareable links, recent history
- English and German UI

## Development

Needs Node 24 (see `.nvmrc`; with nvm: `nvm use`).

```bash
npm install
npm run dev        # dev server on :5173 (add -- --host to test on a phone on the same Wi-Fi)
npm test           # lib unit + scan tests (vitest), then component tests (ng test)
npm run build      # static bundle in dist/, then fills %SITE_URL% (from SITE_URL or .env)
npm run preview    # serve dist/ on :4173
```

Stack: Angular 22 (standalone, zoneless, signals), TypeScript, Tailwind CSS, bwip-js, Lucide.
Framework-free logic (payment codes, validation, storage, rendering) lives in `src/lib/`;
Angular components live in `src/app/`. The last React version is tagged `react-v1`.

## Deployment

Hosted on Azure Static Web Apps (Free plan). Every push to `master` runs tests and the build in
GitHub Actions; the deploy step runs once the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret exists.
One-time setup: [scripts/azure-deploy.sh](scripts/azure-deploy.sh), meant to be run step by step.
Security headers and CSP live in [public/staticwebapp.config.json](public/staticwebapp.config.json).
