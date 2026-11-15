# BarMint

Client-side generator for payment codes and barcodes for the DACH region. Runs entirely in the browser with no backend.

- **Payment codes:** GiroCode / EPC QR (DE, AT) and Swiss QR-bill (CH), with live IBAN, BIC, amount and reference validation
- **Barcodes:** Code 128, EAN-13, EAN-8, UPC-A, QR
- PNG / SVG export, copy to clipboard, shareable links, recent history
- English and German UI

## Development

```bash
npm install
npm run dev        # dev server (add -- --host to test on a phone on the same Wi-Fi)
npm test           # unit, scan (encode → decode) and UI tests
npm run build      # static bundle in dist/
```

Stack: React 19, TypeScript, Vite, Tailwind CSS, bwip-js, lucide-react.

## Deployment

Hosted on Azure Static Web Apps (Free plan). Every push to `master` runs tests and the build in
GitHub Actions; the deploy step runs once the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret exists.
One-time setup: [scripts/azure-deploy.sh](scripts/azure-deploy.sh), meant to be run step by step.
Security headers and CSP live in [public/staticwebapp.config.json](public/staticwebapp.config.json).
