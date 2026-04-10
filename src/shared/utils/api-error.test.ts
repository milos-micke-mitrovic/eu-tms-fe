import { describe, it, expect } from 'vitest'
import { getApiErrorMessage, getApiFieldErrors } from './api-error'
import { HttpError } from '@/shared/api/http-client'

describe('getApiErrorMessage', () => {
  it('extracts message from BE error response', () => {
    const error = new HttpError(400, 'Bad Request', { message: 'Invalid PIB checksum' })
    expect(getApiErrorMessage(error, 'fallback')).toBe('Invalid PIB checksum')
  })

  it('extracts error field', () => {
    const error = new HttpError(400, 'Bad Request', { error: 'Duplicate reg number' })
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
    expect(getApiErrorMessage(error, 'Greška')).toBe('HTTP 500: Internal Server Error')
  })
})

describe('getApiFieldErrors', () => {
  it('extracts nested field errors', () => {
    const error = new HttpError(422, 'Unprocessable', {
      errors: { regNumber: 'Already exists', pib: 'Invalid checksum' },
    })
    const fields = getApiFieldErrors(error)
    expect(fields).toEqual({ regNumber: 'Already exists', pib: 'Invalid checksum' })
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
})
