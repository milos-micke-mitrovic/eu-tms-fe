'use client'

import { forwardRef } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/shared/utils'
import { Label } from './label'
import { Caption } from './typography'

type SwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  'onChange'
> & {
  label?: string
  description?: string
  error?: string
  onChange?: (checked: boolean) => void
}

const Switch = forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchProps
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
    const switchId = id || props.name

    const handleCheckedChange = (checked: boolean) => {
      onChange?.(checked)
      onCheckedChange?.(checked)
    }

    const switchElement = (
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        data-slot="switch"
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${switchId}-error` : undefined}
        onCheckedChange={handleCheckedChange}
        className={cn(
          'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={cn(
            'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitive.Root>
    )

    // If no form field props, return just the switch
    if (!label && !description && !error) {
      return switchElement
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          {switchElement}
          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && (
                <Label
                  htmlFor={switchId}
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
          <Caption id={`${switchId}-error`} color="error">
            {error}
          </Caption>
        )}
      </div>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
