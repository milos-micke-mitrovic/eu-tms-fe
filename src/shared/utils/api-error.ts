import { HttpError } from '@/shared/api/http-client'

type ValidationErrors = Record<string, string>

type ApiErrorData = {
  message?: string
  error?: string
  errors?: ValidationErrors
} & ValidationErrors

/**
 * Extracts a user-friendly error message from an API error response.
 * Handles multiple backend error formats:
 * - { message: "error" }
 * - { error: "error" }
 * - { field: "error message" } (validation errors)
 * - { errors: { field: "error message" } }
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpError && error.data) {
    const data = error.data as ApiErrorData

    // Check for explicit message field
    if (data.message) {
      return data.message
    }

    // Check for error field
    if (data.error) {
      return data.error
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
      .filter(([key, value]) => typeof value === 'string' && !['message', 'error'].includes(key))
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
