'use client'

import { forwardRef } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'

import { cn } from '@/shared/utils'
import { Label } from './label'
import { Caption } from './typography'

type RadioOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type RadioGroupProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Root>,
  'onChange'
> & {
  label?: string
  helperText?: string
  error?: string
  options: RadioOption[]
  onChange?: (value: string) => void
}

const RadioGroup = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(
  (
    {
      className,
      label,
      helperText,
      error,
      options,
      disabled,
      id,
      onChange,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const groupId = id || props.name

    const handleValueChange = (value: string) => {
      onChange?.(value)
      onValueChange?.(value)
    }

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <Label className={cn(error && 'text-destructive')}>{label}</Label>
        )}

        <RadioGroupPrimitive.Root
          ref={ref}
          data-slot="radio-group"
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${groupId}-error`
              : helperText
                ? `${groupId}-helper`
                : undefined
          }
          onValueChange={handleValueChange}
          className={cn('grid gap-3', className)}
          {...props}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-start gap-3">
              <RadioGroupPrimitive.Item
                data-slot="radio-group-item"
                value={option.value}
                id={`${groupId}-${option.value}`}
                disabled={option.disabled}
                className={cn(
                  'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 cursor-pointer rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                  error && 'border-destructive'
                )}
              >
                <RadioGroupPrimitive.Indicator
                  data-slot="radio-group-indicator"
                  className="relative flex items-center justify-center"
                >
                  <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <div className="flex flex-col gap-0.5">
                <Label
                  htmlFor={`${groupId}-${option.value}`}
                  className={cn(
                    'leading-tight font-normal',
                    error && 'text-destructive'
                  )}
                >
                  {option.label}
                </Label>
                {option.description && <Caption>{option.description}</Caption>}
              </div>
            </div>
          ))}
        </RadioGroupPrimitive.Root>

        {error && (
          <Caption id={`${groupId}-error`} color="error">
            {error}
          </Caption>
        )}

        {helperText && !error && (
          <Caption id={`${groupId}-helper`}>{helperText}</Caption>
        )}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

export { RadioGroup, type RadioOption }
