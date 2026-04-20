export const MINUTES_IN_DAY = 1440

export const VIOLATION_TYPE_LABELS: Record<string, string> = {
  DAILY_DRIVING_EXCEEDED: 'Prekoračenje dnevne vožnje',
  DAILY_REST_INSUFFICIENT: 'Nedovoljan dnevni odmor',
  WEEKLY_DRIVING_EXCEEDED: 'Prekoračenje nedeljne vožnje',
  FORTNIGHTLY_DRIVING_EXCEEDED: 'Prekoračenje dvonedeljne vožnje',
  CONTINUOUS_DRIVING_NO_BREAK: 'Vožnja bez pauze',
  WEEKLY_REST_INSUFFICIENT: 'Nedovoljan nedeljni odmor',
}

export const DRIVER_COLORS = [
  '#378ADD',
  '#1D9E75',
  '#BA7517',
  '#E04E5E',
  '#8B5CF6',
  '#06B6D4',
  '#F97316',
  '#EC4899',
] as const

// Assigns a color based on position in the provided list
export function getDriverColor(
  driverName: string,
  allDriverNames: string[]
): string {
  const index = allDriverNames.indexOf(driverName)
  return DRIVER_COLORS[(index >= 0 ? index : 0) % DRIVER_COLORS.length]
}

export const ACTIVITY_COLORS = {
  driving: '#378ADD',
  rest: '#1D9E75',
  otherWork: '#BA7517',
  availability: '#888780',
} as const
