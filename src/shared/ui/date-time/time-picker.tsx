'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, X } from 'lucide-react'

import { cn } from '@/shared/utils'
import { IconButton } from '../button'
import { Label } from '../label'
import { Caption } from '../typography'
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover'

type TimePickerProps = {
  /** Current time value in HH:mm format */
  value?: string
  /** Called when time is selected */
  onChange?: (time: string | undefined) => void
  /** Placeholder text */
  placeholder?: string
  /** Label for the input */
  label?: string
  /** Whether the field is required */
  required?: boolean
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Disabled state */
  disabled?: boolean
  /** Additional class name */
  className?: string
  /** Time step in minutes for quick-select options (default: 15) */
  step?: 5 | 10 | 15 | 30 | 60
  /** Use 24-hour format (default: true) */
  use24Hour?: boolean
  /** Clearable */
  clearable?: boolean
}

function generateTimeOptions(
  step: number,
  use24Hour: boolean,
  amLabel: string,
  pmLabel: string
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  const totalMinutes = 24 * 60

  for (let minutes = 0; minutes < totalMinutes; minutes += step) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const value = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`

    let label: string
    if (use24Hour) {
      label = value
    } else {
      const period = hours >= 12 ? pmLabel : amLabel
      const displayHours = hours % 12 || 12
      label = `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
    }

    options.push({ value, label })
  }

  return options
}

function isValidTime(time: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
  return regex.test(time)
}

function formatTimeInput(input: string): string {
  // Remove non-digits
  const digits = input.replace(/\D/g, '')

  if (digits.length === 0) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`
  }
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
}

function TimePicker({
  value,
  onChange,
  placeholder = 'HH:MM',
  label,
  required,
  error,
  helperText,
  disabled,
  className,
  step = 15,
  use24Hour = true,
  clearable = false,
}: TimePickerProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || '')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const timeOptions = React.useMemo(
    () => generateTimeOptions(step, use24Hour, t('timePicker.am'), t('timePicker.pm')),
    [step, use24Hour, t]
  )

  // Sync input value with prop
  React.useEffect(() => {
    setInputValue(value || '')
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value)
    setInputValue(formatted)

    // Auto-submit if valid time
    if (isValidTime(formatted)) {
      onChange?.(formatted)
    }
  }

  const handleInputBlur = () => {
    // Validate and normalize on blur
    if (inputValue && isValidTime(inputValue)) {
      // Normalize to HH:MM format
      const [hours, minutes] = inputValue.split(':')
      const normalized = `${hours.padStart(2, '0')}:${minutes}`
      setInputValue(normalized)
      onChange?.(normalized)
    } else if (inputValue && !isValidTime(inputValue)) {
      // Reset to last valid value
      setInputValue(value || '')
    }
  }

  const handleOptionSelect = (optionValue: string) => {
    setInputValue(optionValue)
    onChange?.(optionValue)
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputValue('')
    onChange?.(undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && !open) {
      setOpen(true)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Scroll to selected time when opening
  React.useEffect(() => {
    if (open && value && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]')
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center' })
      }
    }
  }, [open, value])

  const showClearButton = clearable && value && !disabled

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'border-input relative flex h-9 w-full max-w-32 items-center rounded-md border bg-transparent shadow-xs transition-[color,box-shadow]',
              'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
              'data-[state=open]:border-ring data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px]',
              error && 'border-destructive ring-destructive/20',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <Clock className="text-muted-foreground pointer-events-none ml-3 size-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'h-full w-full bg-transparent px-2 py-1 text-sm outline-none',
                'placeholder:text-muted-foreground',
                !inputValue && 'text-muted-foreground'
              )}
            />
            {showClearButton && (
              <IconButton
                variant="ghost"
                size="xs"
                icon={<X className="size-3.5" />}
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground mr-1"
                aria-label={t('timePicker.clearTime')}
              />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-32 p-1"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div ref={listRef} className="max-h-52 overflow-y-auto">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                data-selected={value === option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={cn(
                  'w-full rounded-sm px-2 py-1.5 text-left text-sm outline-none',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:bg-accent focus:text-accent-foreground',
                  value === option.value &&
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {helperText && !error && (
        <Caption className="text-muted-foreground">{helperText}</Caption>
      )}
      {error && <Caption color="error">{error}</Caption>}
    </div>
  )
}

export { TimePicker }
