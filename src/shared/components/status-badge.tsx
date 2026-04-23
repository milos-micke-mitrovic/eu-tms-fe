import { Badge } from '@/shared/ui/badge'

type StatusConfig = {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  color?: 'success' | 'warning' | 'destructive' | 'info' | 'muted' | 'default'
}

type StatusBadgeProps = {
  status: string
  config: Record<string, StatusConfig>
  label: string
}

export type { StatusConfig }

export function StatusBadge({ status, config, label }: StatusBadgeProps) {
  const cfg = config[status] ?? { variant: 'outline' as const }
  return (
    <Badge variant={cfg.variant} color={cfg.color}>
      {label}
    </Badge>
  )
}
