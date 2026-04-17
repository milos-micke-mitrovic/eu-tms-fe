import { describe, it, expect, vi } from 'vitest'
import {
  getApiErrorMessage,
  getApiFieldErrors,
  setFormFieldErrors,
} from './api-error'
import { HttpError } from '@/shared/api/http-client'

describe('getApiErrorMessage', () => {
  it('extracts message from BE error response', () => {
    const error = new HttpError(400, 'Bad Request', {
      message: 'Invalid PIB checksum',
    })
    expect(getApiErrorMessage(error, 'fallback')).toBe('Invalid PIB checksum')
  })

  it('extracts error field', () => {
    const error = new HttpError(400, 'Bad Request', {
      error: 'Duplicate reg number',
    })
    expect(getApiErrorMessage(error, 'fallback')).toBe('Duplicate reg number')
  })

  it('joins nested errors', () => {
    const error = new HttpError(422, 'Unprocessable', {
      errors: { regNumber: 'Required', make: 'Required' },
    })
    expect(getApiErrorMessage(error, 'fallback')).toContain('Required')
  })

  it('returns fallback for unknown error shape', () => {
    expect(getApiErrorMessage(new Error('network'), 'Greška')).toBe('network')
    expect(getApiErrorMessage('string error', 'Greška')).toBe('Greška')
    expect(getApiErrorMessage(null, 'Greška')).toBe('Greška')
  })

  it('returns fallback for HttpError without data', () => {
    const error = new HttpError(500, 'Internal Server Error')
    expect(getApiErrorMessage(error, 'Greška')).toBe(
      'HTTP 500: Internal Server Error'
    )
  })
})

describe('getApiFieldErrors', () => {
  it('extracts nested field errors', () => {
    const error = new HttpError(422, 'Unprocessable', {
      errors: { regNumber: 'Already exists', pib: 'Invalid checksum' },
    })
    const fields = getApiFieldErrors(error)
    expect(fields).toEqual({
      regNumber: 'Already exists',
      pib: 'Invalid checksum',
    })
  })

  it('extracts flat field errors', () => {
    const error = new HttpError(400, 'Bad Request', {
      regNumber: 'Required',
      make: 'Required',
    })
    const fields = getApiFieldErrors(error)
    expect(fields).toEqual({ regNumber: 'Required', make: 'Required' })
  })

  it('returns null for no field errors', () => {
    const error = new HttpError(500, 'Internal', { message: 'Server error' })
    expect(getApiFieldErrors(error)).toBeNull()
  })

  it('returns null for non-HttpError', () => {
    expect(getApiFieldErrors(new Error('network'))).toBeNull()
  })

  it('extracts BE VALIDATION_ERROR fieldErrors', () => {
    const error = new HttpError(400, 'Bad Request', {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      fieldErrors: {
        pib: 'PIB must not exceed 9 characters',
        maticniBroj: 'Too long',
      },
    })
    const fields = getApiFieldErrors(error)
    expect(fields).toEqual({
      pib: 'PIB must not exceed 9 characters',
      maticniBroj: 'Too long',
    })
  })
})

describe('setFormFieldErrors', () => {
  it('calls setError for each field error', () => {
    const error = new HttpError(400, 'Bad Request', {
      fieldErrors: { pib: 'Too long', name: 'Required' },
    })
    const setError = vi.fn()
    const result = setFormFieldErrors(error, setError)
    expect(result).toBe(true)
    expect(setError).toHaveBeenCalledTimes(2)
    expect(setError).toHaveBeenCalledWith('pib', { message: 'Too long' })
    expect(setError).toHaveBeenCalledWith('name', { message: 'Required' })
  })

  it('returns false when no field errors', () => {
    const error = new HttpError(500, 'Internal', { message: 'Server error' })
    const setError = vi.fn()
    expect(setFormFieldErrors(error, setError)).toBe(false)
    expect(setError).not.toHaveBeenCalled()
  })
})
