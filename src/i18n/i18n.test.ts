import { describe, it, expect } from 'vitest'
import { resources } from './index'

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

describe('i18n translations', () => {
  const namespaces = Object.keys(resources.sr) as (keyof typeof resources.sr)[]

  for (const ns of namespaces) {
    it(`${ns}: Serbian and English have the same keys`, () => {
      const srKeys = getAllKeys(resources.sr[ns] as Record<string, unknown>).sort()
      const enKeys = getAllKeys(resources.en[ns] as Record<string, unknown>).sort()

      const missingSr = enKeys.filter((k) => !srKeys.includes(k))
      const missingEn = srKeys.filter((k) => !enKeys.includes(k))

      if (missingSr.length > 0) {
        console.warn(`Missing in Serbian (${ns}):`, missingSr)
      }
      if (missingEn.length > 0) {
        console.warn(`Missing in English (${ns}):`, missingEn)
      }

      expect(missingSr, `Keys in English but missing in Serbian (${ns})`).toEqual([])
      expect(missingEn, `Keys in Serbian but missing in English (${ns})`).toEqual([])
    })
  }

  it('both locales have the same namespaces', () => {
    const srNs = Object.keys(resources.sr).sort()
    const enNs = Object.keys(resources.en).sort()
    expect(srNs).toEqual(enNs)
  })
})
