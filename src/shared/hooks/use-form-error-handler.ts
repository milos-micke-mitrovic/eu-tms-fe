import { useCallback } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { setFormFieldErrors } from '@/shared/utils'

/**
 * Returns a callback that extracts API field errors and sets them on the form.
 * Simplifies catch blocks in form submit handlers.
 *
 * Usage:
 *   const handleFieldErrors = useFormErrorHandler(form)
 *   try { ... } catch (error) { handleFieldErrors(error) }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormErrorHandler(form: UseFormReturn<any>) {
  return useCallback(
    (error: unknown) => {
      setFormFieldErrors(error, form.setError)
    },
    [form]
  )
}
