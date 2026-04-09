'use client'

import { forwardRef } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/shared/utils'
import { Label } from './label'
import { Caption } from './typography'

type CheckboxProps = Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  'onChange'
> & {
  label?: string
  description?: string
  error?: string
  onChange?: (checked: boolean) => void
}

const Checkbox = forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      className,
      label,
      description,
      error,
      disabled,
      id,
      onChange,
      onCheckedChange,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || props.name

    const handleCheckedChange = (checked: CheckboxPrimitive.CheckedState) => {
      if (typeof checked === 'boolean') {
        onChange?.(checked)
      }
      onCheckedChange?.(checked)
    }

    const checkboxElement = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        data-slot="checkbox"
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${checkboxId}-error` : undefined}
        onCheckedChange={handleCheckedChange}
        className={cn(
          'peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive size-4 shrink-0 cursor-pointer rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="grid place-content-center text-current transition-none"
        >
          <CheckIcon className="size-3.5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )

    // If no form field props, return just the checkbox
    if (!label && !description && !error) {
      return checkboxElement
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          {checkboxElement}
          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && (
                <Label
                  htmlFor={checkboxId}
                  className={cn('leading-tight', error && 'text-destructive')}
                >
                  {label}
                </Label>
              )}
              {description && <Caption>{description}</Caption>}
            </div>
          )}
        </div>

        {error && (
          <Caption id={`${checkboxId}-error`} color="error">
            {error}
          </Caption>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
