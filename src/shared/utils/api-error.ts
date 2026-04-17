import { HttpError } from '@/shared/api/http-client'
import i18n from '@/i18n'

type ValidationErrors = Record<string, string>

type ApiErrorData = {
  message?: string
  error?: string
  errorCode?: string
  errors?: ValidationErrors
  fieldErrors?: ValidationErrors
} & ValidationErrors

/**
 * Extracts a user-friendly error message from an API error response.
 * Handles multiple backend error formats:
 * - { errorCode: "DUPLICATE_RESOURCE", message: "..." } → translated by errorCode
 * - { message: "error" }
 * - { error: "error" }
 * - { field: "error message" } (validation errors)
 * - { errors: { field: "error message" } }
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError && error.data) {
    const data = error.data as ApiErrorData

    // Check for errorCode → use localized message
    if (data.errorCode) {
      const key = `common:apiErrors.${data.errorCode}`
      const translated = i18n.t(key, { defaultValue: '' })
      if (translated) return translated
    }

    // Check for explicit message field
    if (data.message) {
      return data.message
    }

    // Check for error field
    if (data.error) {
      return data.error
    }

    // Check for fieldErrors (BE VALIDATION_ERROR shape)
    if (data.fieldErrors && typeof data.fieldErrors === 'object') {
      const messages = Object.values(data.fieldErrors).filter(Boolean)
      if (messages.length > 0) {
        return messages.join('. ')
      }
    }

    // Check for nested errors object
    if (data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).filter(Boolean)
      if (messages.length > 0) {
        return messages.join('. ')
      }
    }

    // Check for flat validation errors (field: "error message")
    const fieldErrors = Object.entries(data)
      .filter(
        ([key, value]) =>
          typeof value === 'string' && !['message', 'error'].includes(key)
      )
      .map(([, value]) => value)

    if (fieldErrors.length > 0) {
      return fieldErrors.join('. ')
    }
  }

  // Check for standard Error objects
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

/**
 * Extracts field-specific validation errors from an API error response.
 * Useful for setting form field errors.
 */
export function getApiFieldErrors(error: unknown): ValidationErrors | null {
  if (error instanceof HttpError && error.data) {
    const data = error.data as ApiErrorData

    // Check for fieldErrors (BE VALIDATION_ERROR shape)
    if (data.fieldErrors && typeof data.fieldErrors === 'object') {
      return data.fieldErrors
    }

    // Check for nested errors object
    if (data.errors && typeof data.errors === 'object') {
      return data.errors
    }

    // Check for flat validation errors
    const fieldErrors: ValidationErrors = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && !['message', 'error'].includes(key)) {
        fieldErrors[key] = value
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fieldErrors
    }
  }

  return null
}

/**
 * Extracts field validation errors from an API error and sets them on a
 * react-hook-form instance. Returns true if field errors were found and set,
 * so the caller can skip showing a generic toast.
 */
export function setFormFieldErrors(
  error: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setError: (name: any, error: { message: string }) => void
): boolean {
  const fieldErrors = getApiFieldErrors(error)
  if (!fieldErrors) return false
  for (const [field, message] of Object.entries(fieldErrors)) {
    setError(field, { message })
  }
  return true
}
