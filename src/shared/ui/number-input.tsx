'use client'

import { forwardRef, useState } from 'react'

import { Input } from './input'

type BaseInputProps = Omit<
  React.ComponentProps<typeof Input>,
  | 'type'
  | 'value'
  | 'onChange'
  | 'defaultValue'
  | 'debounce'
  | 'onDebounceChange'
>

export type NumberInputProps = BaseInputProps & {
  /** Numeric value. `null`/`undefined`/`NaN` render as an empty field (placeholder). */
  value?: number | null
  /** Emits a parsed number, or `undefined` when the field is cleared. */
  onChange?: (value: number | undefined) => void
}

/**
 * Number input for React Hook Form fields.
 *
 * Fixes the two long-standing number-input bugs:
 *  1. A default of `0` no longer renders a literal "0" you must overtype — pass
 *     `undefined` as the field default and the field starts empty with its placeholder.
 *  2. Clearing the field emits `undefined` (not `0`), so the zero never respawns.
 *
 * Keeps an internal text string so partially-typed decimals ("1.", "1.0") survive
 * re-renders instead of being collapsed by `Number()`. Re-syncs from the external
 * value on form reset / edit prefill.
 *
 * Usage: `<NumberInput value={field.value} onChange={field.onChange} />`
 */
const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const toText = (v: number | null | undefined) =>
      v == null || Number.isNaN(v) ? '' : String(v)

    const [text, setText] = useState(() => toText(value))

    // Re-sync internal text when the external value changes to something that
    // doesn't match what we're showing (form.reset, edit prefill, programmatic set).
    // Render-time state adjustment per https://react.dev/learn/you-might-not-need-an-effect
    const [prevValue, setPrevValue] = useState(value)
    if (value !== prevValue) {
      setPrevValue(value)
      const parsed = text === '' ? undefined : Number(text)
      if (value !== parsed) {
        setText(toText(value))
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="number"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const raw = e.target.value
          setText(raw)
          if (raw === '') {
            onChange?.(undefined)
            return
          }
          const num = Number(raw)
          if (!Number.isNaN(num)) {
            onChange?.(num)
          }
        }}
      />
    )
  }
)

NumberInput.displayName = 'NumberInput'

export { NumberInput }
