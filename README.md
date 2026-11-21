# mrvoje.com

Hi, I'm **Hrvoje Mrvoje**. I'm a software developer interested in AI and in how it changes the
way software gets built.

This is my personal website at [mrvoje.com](https://mrvoje.com). It's where I publish the things
I build: small, focused tools that solve one real problem well, are pleasant to use and respect
people's privacy.

## Projects

### BarMint: payment QR codes for Germany, Austria and Switzerland

[barmint.mrvoje.com](https://barmint.mrvoje.com)

In the DACH region you can pay an invoice by scanning a QR code with your banking app. The app
fills in the recipient, IBAN, amount and reference, so there's nothing to type and no typos.

BarMint lets anyone create these codes in a few seconds:

- **Freelancers and small businesses** put a payment QR code on their invoices, so clients pay
  faster and correctly.
- **Clubs, landlords and event organisers** share a code for membership fees, rent or tickets.
- **Anyone splitting a bill** sends a code instead of spelling out an IBAN.

It supports the official formats: **GiroCode / EPC QR** (Germany, Austria) and the **Swiss
QR-bill** (Switzerland). It checks every entry as you type, so the code always works in the
banking app. You can also create classic **barcodes** (EAN, UPC, Code 128, QR) for products and
labels.

What makes it different:

- **Private.** Nothing is uploaded and there's no account and no tracking. Everything happens in
  your browser.
- **Instant.** The code updates while you type, ready to download as PNG or SVG, copy, or share
  as a link.
- **In your language:** German and English.

*More projects are on the way.*

## How I build

Every project here is built like a real product, not a demo:

- **Fast.** Pages load in a fraction of a second, and each project loads only what it needs.
- **Reliable.** Each payment code is tested by actually scanning it, and every change is checked
  automatically before it goes live.
- **Secure and private by design.** No backend, no tracking, strict browser security rules.
- **Carefully designed.** One clean design for the whole site, light and dark mode, keyboard
  and screen-reader friendly. Each project has its own colour.

Built with Angular, TypeScript and Tailwind CSS.

## Contact

Interested in working together, or have an idea for a project? Get in touch through
[mrvoje.com](https://mrvoje.com) or at hmrvoje@gmail.com.

<details>
<summary>For developers: run it locally</summary>

Requires Node 24.

```bash
npm install
npm run dev     # development server
npm test        # all tests
```

</details>
