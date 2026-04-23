import { Caption } from '@/shared/ui/typography'
import { BodySmall } from '@/shared/ui/typography'

type InfoRowProps = {
  label: string
  value: React.ReactNode
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value ?? '—'}</BodySmall>
    </div>
  )
}
