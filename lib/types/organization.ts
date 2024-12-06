export type AvailableFeature = 'events' | 'groups' | 'donations' | 'messaging' | 'attendance'

export const AVAILABLE_FEATURES: readonly AvailableFeature[] = [
  'events',
  'groups',
  'donations',
  'messaging',
  'attendance',
] as const 