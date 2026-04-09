/**
 * Shared validation utilities for consistent form validation across the app.
 */

/**
 * Email regex pattern that requires:
 * - At least one character before @
 * - @ symbol
 * - At least one character for domain name
 * - A dot
 * - At least two characters for TLD
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * PIB (Serbian tax ID) validation — mod 11 checksum
 * Ported from BE: com.eutms.shared.util.PibValidator
 */
export function isValidPib(pib: string): boolean {
  if (!/^\d{9}$/.test(pib)) return false
  const d = pib.split('').map(Number)
  let sum = 10
  for (let i = 0; i < 8; i++) {
    sum = (sum + d[i]) % 10
    if (sum === 0) sum = 10
    sum = (sum * 2) % 11
  }
  return (11 - sum) % 10 === d[8]
}

/**
 * JMBG (Serbian personal ID) validation — mod 11 checksum
 * Ported from BE: com.eutms.shared.util.JmbgValidator
 */
export function isValidJmbg(jmbg: string): boolean {
  if (!/^\d{13}$/.test(jmbg)) return false
  const d = jmbg.split('').map(Number)
  const sum =
    7 * (d[0] + d[6]) +
    6 * (d[1] + d[7]) +
    5 * (d[2] + d[8]) +
    4 * (d[3] + d[9]) +
    3 * (d[4] + d[10]) +
    2 * (d[5] + d[11])
  const r = sum % 11
  const control = r < 2 ? 0 : 11 - r
  return control < 10 && control === d[12]
}

/**
 * Creates a validation rule object for React Hook Form email fields
 * @param requiredMessage - Message to show when field is empty
 * @param invalidMessage - Message to show when email format is invalid
 * @param isRequired - Whether the field is required (default: true)
 */
export function emailValidationRules(
  requiredMessage: string,
  invalidMessage: string,
  isRequired = true
) {
  return {
    ...(isRequired && { required: requiredMessage }),
    pattern: {
      value: EMAIL_REGEX,
      message: invalidMessage,
    },
  }
}
