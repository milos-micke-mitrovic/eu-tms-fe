import type { ElementType, ReactNode } from 'react'
import { cn } from '@/shared/utils'

export type TextColor = 'default' | 'muted' | 'error' | 'success' | 'warning' | 'info'

const colorClasses: Record<TextColor, string> = {
  default: '',
  muted: 'text-muted-foreground',
  error: 'text-destructive',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
}

type TypographyProps = {
  children?: ReactNode
  className?: string
  color?: TextColor
  uppercase?: boolean
  lowercase?: boolean
  capitalize?: boolean
  truncate?: boolean
  nowrap?: boolean
  italic?: boolean
}

function getTextClasses({
  color = 'default',
  uppercase,
  lowercase,
  capitalize,
  truncate,
  nowrap,
  italic,
}: Omit<TypographyProps, 'children' | 'className'>) {
  return cn(
    colorClasses[color],
    uppercase && 'uppercase',
    lowercase && 'lowercase',
    capitalize && 'capitalize',
    truncate && 'truncate',
    nowrap && 'whitespace-nowrap',
    italic && 'italic'
  )
}

type HeadingProps = TypographyProps & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function H1({
  children,
  className,
  as: Tag = 'h1',
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn('text-h1', getTextClasses(props), className)}>
      {children}
    </Tag>
  )
}

export function H2({
  children,
  className,
  as: Tag = 'h2',
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn('text-h2', getTextClasses(props), className)}>
      {children}
    </Tag>
  )
}

export function H3({
  children,
  className,
  as: Tag = 'h3',
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn('text-h3', getTextClasses(props), className)}>
      {children}
    </Tag>
  )
}

export function H4({
  children,
  className,
  as: Tag = 'h4',
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn('text-h4', getTextClasses(props), className)}>
      {children}
    </Tag>
  )
}

type TextProps = Omit<React.ComponentProps<'p'>, 'color'> &
  TypographyProps & {
    as?: ElementType
  }

export function Body({
  children,
  className,
  as: Tag = 'p',
  color,
  uppercase,
  lowercase,
  capitalize,
  truncate,
  nowrap,
  italic,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        'text-body',
        getTextClasses({
          color,
          uppercase,
          lowercase,
          capitalize,
          truncate,
          nowrap,
          italic,
        }),
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function BodySmall({
  children,
  className,
  as: Tag = 'p',
  color,
  uppercase,
  lowercase,
  capitalize,
  truncate,
  nowrap,
  italic,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        'text-body-sm',
        getTextClasses({
          color,
          uppercase,
          lowercase,
          capitalize,
          truncate,
          nowrap,
          italic,
        }),
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

type CaptionProps = Omit<React.ComponentProps<'span'>, 'color'> &
  TypographyProps & {
    as?: ElementType
  }

export function Caption({
  children,
  className,
  as: Tag = 'span',
  color = 'muted',
  uppercase,
  lowercase,
  capitalize,
  truncate,
  nowrap,
  italic,
  ...props
}: CaptionProps) {
  return (
    <Tag
      className={cn(
        'text-xs',
        getTextClasses({
          color,
          uppercase,
          lowercase,
          capitalize,
          truncate,
          nowrap,
          italic,
        }),
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function Muted({
  children,
  className,
  as: Tag = 'p',
  color,
  uppercase,
  lowercase,
  capitalize,
  truncate,
  nowrap,
  italic,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        'text-muted text-muted-foreground',
        getTextClasses({
          color,
          uppercase,
          lowercase,
          capitalize,
          truncate,
          nowrap,
          italic,
        }),
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function Label({
  children,
  className,
  as: Tag = 'span',
  color,
  uppercase,
  lowercase,
  capitalize,
  truncate,
  nowrap,
  italic,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        'text-label',
        getTextClasses({
          color,
          uppercase,
          lowercase,
          capitalize,
          truncate,
          nowrap,
          italic,
        }),
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
