import { z } from 'zod'
import i18n from '@/i18n'

// Custom Zod 4 locale that uses our i18n translations
z.config({
  localeError: (issue) => {
    const t = i18n.t.bind(i18n)

    switch (issue.code) {
      case 'too_small':
        // string.min(1) or array.min(1) → "required"
        if (
          issue.minimum === 1 &&
          (issue.type === 'string' || issue.type === 'array')
        ) {
          return t('common:validation.required')
        }
        // number.positive() or number.min(0) → "required" (it's a number field validation)
        if (issue.type === 'number') {
          return t('common:validation.required')
        }
        return t('common:validation.required')
      case 'too_big':
        return t('common:validation.maxLength', { max: String(issue.maximum) })
      case 'invalid_type':
        return t('common:validation.required')
      case 'invalid_format':
        return t('common:validation.email')
      case 'invalid_value':
        return t('common:validation.required')
      default:
        return z.locales.en().localeError(issue)
    }
  },
})
