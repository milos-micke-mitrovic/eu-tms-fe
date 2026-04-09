import { forwardRef } from 'react'

import { cn } from '@/shared/utils'
import { Label } from './label'
import { Caption } from './typography'

type TextareaProps = React.ComponentProps<'textarea'> & {
  label?: string
  helperText?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, disabled, id, ...props }, ref) => {
    const textareaId = id || props.name

    const textareaElement = (
      <textarea
        ref={ref}
        id={textareaId}
        data-slot="textarea"
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${textareaId}-error`
            : helperText
              ? `${textareaId}-helper`
              : undefined
        }
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex field-sizing-content min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        {...props}
      />
    )

    // If no form field props, return just the textarea
    if (!label && !helperText && !error) {
      return textareaElement
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label
            htmlFor={textareaId}
            className={cn(error && 'text-destructive')}
          >
            {label}
          </Label>
        )}

        {textareaElement}

        {error && (
          <Caption id={`${textareaId}-error`} color="error">
            {error}
          </Caption>
        )}

        {helperText && !error && (
          <Caption id={`${textareaId}-helper`}>{helperText}</Caption>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
