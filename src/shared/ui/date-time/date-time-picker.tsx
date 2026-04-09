'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO, parse, isValid } from 'date-fns'
import { CalendarIcon, Clock, X } from 'lucide-react'

import { cn } from '@/shared/utils'
import { IconButton } from '../button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover'
import { Label } from '../label'
import { Caption } from '../typography'

type DateTimePickerProps = {
  /** Current datetime value (Date object or ISO string like YYYY-MM-DDTHH:mm) */
  value?: Date | string
  /** Called when datetime is selected */
  onChange?: (datetime: Date | string | undefined) => void
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
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Whether to show clear button */
  clearable?: boolean
  /** Return format: 'date' returns Date object, 'iso' returns ISO string (YYYY-MM-DDTHH:mm) */
  returnFormat?: 'date' | 'iso'
}

function parseValue(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return isValid(value) ? value : undefined
  try {
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

function formatDateTimeInput(input: string): string {
  const digits = input.replace(/\D/g, '')

  if (digits.length === 0) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  if (digits.length <= 10)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10, 12)}`
}

function parseUserInput(input: string): Date | null {
  const parsed = parse(input, 'dd/MM/yyyy HH:mm', new Date())
  if (isValid(parsed)) return parsed
  // Also try date-only input
  const dateOnly = parse(input, 'dd/MM/yyyy', new Date())
  if (isValid(dateOnly)) return dateOnly
  return null
}

function formatForDisplay(date: Date | undefined): string {
  if (!date) return ''
  return format(date, 'dd/MM/yyyy HH:mm')
}

function formatTimeInput(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
}

function isValidTime(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(time)
}

function DateTimePicker({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY HH:MM',
  label,
  required,
  error,
  helperText,
  disabled,
  className,
  minDate,
  maxDate,
  clearable = true,
  returnFormat = 'iso',
}: DateTimePickerProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = React.useState(false)
  const dateValue = parseValue(value)
  const [inputValue, setInputValue] = React.useState(formatForDisplay(dateValue))
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [timeInputValue, setTimeInputValue] = React.useState(
    dateValue ? format(dateValue, 'HH:mm') : ''
  )

  React.useEffect(() => {
    const parsed = parseValue(value)
    setInputValue(formatForDisplay(parsed))
    setTimeInputValue(parsed ? format(parsed, 'HH:mm') : '')
  }, [value])

  const emitChange = (date: Date | undefined) => {
    if (returnFormat === 'iso' && date) {
      onChange?.(format(date, "yyyy-MM-dd'T'HH:mm"))
    } else {
      onChange?.(date)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateTimeInput(e.target.value)
    setInputValue(formatted)

    // Auto-submit if valid complete datetime (DD/MM/YYYY HH:MM = 16 chars)
    if (formatted.length === 16) {
      const parsed = parseUserInput(formatted)
      if (parsed) {
        if (minDate && parsed < minDate) return
        if (maxDate && parsed > maxDate) return
        emitChange(parsed)
      }
    }
  }

  const handleInputBlur = () => {
    if (inputValue && (inputValue.length === 16 || inputValue.length === 10)) {
      const parsed = parseUserInput(inputValue)
      if (parsed) {
        if (minDate && parsed < minDate) {
          setInputValue(formatForDisplay(dateValue))
          return
        }
        if (maxDate && parsed > maxDate) {
          setInputValue(formatForDisplay(dateValue))
          return
        }
        emitChange(parsed)
      } else {
        setInputValue(formatForDisplay(dateValue))
      }
    } else if (inputValue && inputValue.length > 0) {
      setInputValue(formatForDisplay(dateValue))
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return
    // Preserve existing time when changing date
    if (dateValue) {
      date.setHours(dateValue.getHours(), dateValue.getMinutes())
    }
    setInputValue(formatForDisplay(date))
    emitChange(date)
  }

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value)
    setTimeInputValue(formatted)

    if (isValidTime(formatted)) {
      const [hours, minutes] = formatted.split(':').map(Number)
      const base = dateValue ? new Date(dateValue) : new Date()
      base.setHours(hours, minutes, 0, 0)
      setInputValue(formatForDisplay(base))
      emitChange(base)
    }
  }

  const handleTimeInputBlur = () => {
    if (timeInputValue && isValidTime(timeInputValue)) {
      const [hours, minutes] = timeInputValue.split(':')
      const normalized = `${hours.padStart(2, '0')}:${minutes}`
      setTimeInputValue(normalized)
    } else if (timeInputValue) {
      // Reset to last valid value
      setTimeInputValue(dateValue ? format(dateValue, 'HH:mm') : '')
    }
  }

  const handleTimeInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidTime(timeInputValue)) {
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputValue('')
    onChange?.(undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown' && !open) {
      setOpen(true)
    }
  }

  const showClearButton = clearable && dateValue && !disabled

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
              'border-input relative flex h-9 w-full items-center rounded-md border bg-transparent shadow-xs transition-[color,box-shadow]',
              'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
              'data-[state=open]:border-ring data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px]',
              error && 'border-destructive ring-destructive/20',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <CalendarIcon className="text-muted-foreground pointer-events-none ml-3 size-4 shrink-0 opacity-50" />
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
                aria-label={t('datePicker.clearDate')}
              />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleCalendarSelect}
              defaultMonth={dateValue}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
            />
            <div className="border-l flex flex-col items-center justify-center px-3 gap-1.5">
              <Clock className="text-muted-foreground size-4 opacity-50" />
              <input
                type="text"
                inputMode="numeric"
                value={timeInputValue}
                onChange={handleTimeInputChange}
                onBlur={handleTimeInputBlur}
                onKeyDown={handleTimeInputKeyDown}
                placeholder="HH:MM"
                className={cn(
                  'w-16 rounded-md border border-input bg-transparent px-2 py-1.5 text-center text-sm outline-none',
                  'focus:border-ring focus:ring-ring/50 focus:ring-[3px]',
                  'placeholder:text-muted-foreground'
                )}
              />
            </div>
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

export { DateTimePicker }
