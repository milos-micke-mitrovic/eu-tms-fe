import { cn } from '@/shared/utils'

type LogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
  xl: 'size-14',
}

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="EU TMS"
      className={cn(sizeClasses[size], 'object-contain', className)}
    />
  )
}
