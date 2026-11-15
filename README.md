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
