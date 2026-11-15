/**
 * BarMint used to live at the site root, so shared links look like `/#s=…` (or `/?s=…`,
 * `/#impressum`). Now that the root is the portfolio, move those links to /barmint
 * before the router starts, keeping the form data in the fragment.
 */
export function moveLegacyBarMintLink(loc: Location = location, hist: History = history) {
  const atRoot = loc.pathname === '/' || loc.pathname === '/index.html'
  const isBarMint =
    /^#(s=|impressum$|datenschutz$)/.test(loc.hash) || new URLSearchParams(loc.search).has('s')
  if (atRoot && isBarMint) hist.replaceState(null, '', `/barmint${loc.search}${loc.hash}`)
}
