import { describe, expect, it } from 'vitest'
import { moveLegacyBarMintLink } from './legacy-links'

const at = (url: string) => {
  history.replaceState(null, '', url)
  moveLegacyBarMintLink()
  return location.pathname + location.search + location.hash
}

describe('moveLegacyBarMintLink', () => {
  it('moves old BarMint links from the root to /barmint', () => {
    expect(at('/#s=eyJtb2RlIjoiYmFyY29kZSJ9')).toBe('/barmint#s=eyJtb2RlIjoiYmFyY29kZSJ9')
    expect(at('/#impressum')).toBe('/barmint#impressum')
    expect(at('/#datenschutz')).toBe('/barmint#datenschutz')
    expect(at('/?s=abc')).toBe('/barmint?s=abc')
  })

  it('leaves portfolio and project URLs alone', () => {
    expect(at('/')).toBe('/')
    expect(at('/projects')).toBe('/projects')
    expect(at('/#about')).toBe('/#about')
    expect(at('/barmint#s=abc')).toBe('/barmint#s=abc')
  })
})
