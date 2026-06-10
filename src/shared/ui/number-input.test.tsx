import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { NumberInput } from './number-input'

const field = () => screen.getByRole('spinbutton') as HTMLInputElement

/** Controlled wrapper mimicking a React Hook Form field. */
function Harness({
  initial,
  onChangeSpy,
}: {
  initial?: number | null
  onChangeSpy: (v: number | undefined) => void
}) {
  const [value, setValue] = useState<number | null | undefined>(initial)
  return (
    <NumberInput
      value={value}
      onChange={(v) => {
        setValue(v)
        onChangeSpy(v)
      }}
    />
  )
}

describe('NumberInput', () => {
  it('renders empty (not "0") when value is null/undefined', () => {
    render(<NumberInput value={null} onChange={() => {}} />)
    expect(field().value).toBe('')
  })

  it('emits undefined (not 0) when cleared — the zombie-zero bug', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<Harness initial={5} onChangeSpy={spy} />)

    await user.clear(field())

    expect(spy).toHaveBeenLastCalledWith(undefined)
    expect(field().value).toBe('') // stays empty, does not respawn as 0
  })

  it('emits a parsed number while typing', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<Harness onChangeSpy={spy} />)

    await user.type(field(), '42')

    expect(spy).toHaveBeenLastCalledWith(42)
  })

  it('preserves a partially-typed decimal ("1.5")', async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<Harness onChangeSpy={spy} />)

    await user.type(field(), '1.5')

    expect(spy).toHaveBeenLastCalledWith(1.5)
    expect(field().value).toBe('1.5')
  })

  it('shows an explicit 0 when the value really is 0', () => {
    render(<NumberInput value={0} onChange={() => {}} />)
    expect(field().value).toBe('0')
  })

  it('re-syncs when the external value changes (form reset / edit prefill)', () => {
    const { rerender } = render(<NumberInput value={1} onChange={() => {}} />)
    expect(field().value).toBe('1')

    rerender(<NumberInput value={99} onChange={() => {}} />)
    expect(field().value).toBe('99')

    rerender(<NumberInput value={undefined} onChange={() => {}} />)
    expect(field().value).toBe('')
  })
})
