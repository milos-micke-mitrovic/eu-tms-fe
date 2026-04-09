'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO, parse, isValid } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'

import { cn } from '@/shared/utils'
import { IconButton } from '../button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover'
import { Label } from '../label'
import { Caption } from '../typography'

type DatePickerProps = {
  /** Current date value (Date object or ISO string) */
  value?: Date | string
  /** Called when date is selected - returns Date or string based on returnFormat */
  onChange?: (date: Date | string | undefined) => void
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
  /** Return format: 'date' returns Date object, 'iso' returns ISO string (YYYY-MM-DD) */
  returnFormat?: 'date' | 'iso'
}

function parseValue(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value
  try {
    return parseISO(value)
  } catch {
    return undefined
  }
}

// Format date input as user types: DD/MM/YYYY
function formatDateInput(input: string): string {
  const digits = input.replace(/\D/g, '')

  if (digits.length === 0) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
}

// Parse user input (DD/MM/YYYY) to Date
function parseUserInput(input: string): Date | null {
  // Try DD/MM/YYYY format
  const parsed = parse(input, 'dd/MM/yyyy', new Date())
  if (isValid(parsed)) {
    return parsed
  }
  return null
}

// Format Date to display string (DD/MM/YYYY)
function formatForDisplay(date: Date | undefined): string {
  if (!date) return ''
  return format(date, 'dd/MM/yyyy')
}

function DatePicker({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
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
}: DatePickerProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = React.useState(false)
  const dateValue = parseValue(value)
  const [inputValue, setInputValue] = React.useState(formatForDisplay(dateValue))
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sync input value with prop
  React.useEffect(() => {
    setInputValue(formatForDisplay(parseValue(value)))
  }, [value])

  const emitChange = (date: Date | undefined) => {
    if (returnFormat === 'iso' && date) {
      onChange?.(format(date, 'yyyy-MM-dd'))
    } else {
      onChange?.(date)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value)
    setInputValue(formatted)

    // Auto-submit if valid complete date
    if (formatted.length === 10) {
      const parsed = parseUserInput(formatted)
      if (parsed) {
        // Check min/max constraints
        if (minDate && parsed < minDate) return
        if (maxDate && parsed > maxDate) return
        emitChange(parsed)
      }
    }
  }

  const handleInputBlur = () => {
    if (inputValue && inputValue.length === 10) {
      const parsed = parseUserInput(inputValue)
      if (parsed) {
        // Check min/max constraints
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
        // Invalid date, reset
        setInputValue(formatForDisplay(dateValue))
      }
    } else if (inputValue && inputValue.length > 0) {
      // Incomplete date, reset
      setInputValue(formatForDisplay(dateValue))
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    setInputValue(formatForDisplay(date))
    emitChange(date)
    setOpen(false)
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
        </PopoverContent>
      </Popover>
      {helperText && !error && (
        <Caption className="text-muted-foreground">{helperText}</Caption>
      )}
      {error && <Caption color="error">{error}</Caption>}
    </div>
  )
}

export { DatePicker }
