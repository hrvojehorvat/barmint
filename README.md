# BarMint

Payment QR codes and barcodes for Germany, Austria and Switzerland, live at
[barmint.mrvoje.com](https://barmint.mrvoje.com).

- **GiroCode / EPC QR** (Germany, Austria) and the **Swiss QR-bill** (Switzerland): scan with a banking app, nothing to type.
- Classic **barcodes**: EAN-13/8, UPC-A, Code 128, QR.
- Live preview, PNG / SVG / clipboard export, shareable links, recent history. English and German.
- **Private:** runs entirely in the browser. No backend, no account, no tracking.

## Develop

Node 24.

```sh
npm install
npm run dev        # http://localhost:5174
npm test && npm run lint
npm run build      # dist/
npm run preview    # http://localhost:4174
```

Every push to `main` is tested, built and deployed to its Azure Static Web App by GitHub Actions.

History up to November 2026 lives in [hrvojehorvat/mrvoje](https://github.com/hrvojehorvat/mrvoje) (tag `monorepo-v1`).
