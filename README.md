# Mrvoje: portfolio and BarMint

My personal site, with the projects it hosts. Everything runs in the browser, with no backend.

| Route | What |
| --- | --- |
| `/` | Portfolio home: a short intro and the projects |
| `/projects` | All projects |
| `/barmint` | **BarMint**: payment codes and barcodes for the DACH region |

## BarMint

- **Payment codes:** GiroCode / EPC QR (DE, AT) and Swiss QR-bill (CH), with live IBAN, BIC, amount and reference validation
- **Barcodes:** Code 128, EAN-13, EAN-8, UPC-A, QR
- PNG / SVG export, copy to clipboard, shareable links (`/barmint#s=…`), recent history
- English and German UI

Old links at the site root (`/#s=…`, `/#impressum`, …) are redirected to `/barmint`.

## Design

All pages share one design. Shared UI uses `accent-*` colours, which are neutral by default
(the portfolio look). Each project remaps them with its own theme class in `src/styles.css`
(BarMint: `.theme-mint`).

## Development

Needs Node 24 (see `.nvmrc`; with nvm: `nvm use`).

```bash
npm install
npm run dev        # Angular dev server (add -- --host to test on a phone on the same Wi-Fi)
npm test           # lib unit + scan tests (vitest), then component tests (ng test)
npm run lint       # oxlint
npm run build      # static bundle in dist/, then fills %SITE_URL% (from SITE_URL or .env)
npm run preview    # serve dist/ on :4173 with SPA fallback
```

Stack: Angular 22 (standalone, zoneless, signals, router), TypeScript, Tailwind CSS, bwip-js, Lucide.

```
src/app/portfolio/   portfolio layout, home, projects page, project list (projects.ts)
src/app/barmint/     BarMint (lazy-loaded, so bwip-js is not in the home bundle)
src/app/ui/          shared UI components
src/lib/             framework-free logic (payment codes, validation, storage, rendering)
```

The last React version is tagged `react-v1`.

## Deployment

Hosted on Azure Static Web Apps (Free plan). Every push to `master` runs tests and the build in
GitHub Actions; the deploy step runs once the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret exists.
One-time setup: [scripts/azure-deploy.sh](scripts/azure-deploy.sh), meant to be run step by step.
Security headers, CSP and caching live in [public/staticwebapp.config.json](public/staticwebapp.config.json).
