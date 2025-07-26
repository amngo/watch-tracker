import { Clock, Check, SkipForward } from 'lucide-react'
import type { EpisodeWatchStatus } from '@/types'

/**
 * Episode status configuration with visual styling and metadata
 */
export const EPISODE_STATUS_CONFIG = {
  UNWATCHED: {
    label: 'Not Watched',
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    borderColor: 'border-muted',
    opacity: 'opacity-100',
    badgeVariant: 'outline' as const,
  },
  WATCHED: {
    label: 'Watched',
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-muted/20',
    borderColor: 'border-green-300',
    opacity: 'opacity-30',
    badgeVariant: 'default' as const,
  },
  SKIPPED: {
    label: 'Skipped',
    icon: SkipForward,
    color: 'text-orange-600',
    bgColor: 'bg-muted/20',
    borderColor: 'border-orange-300',
    opacity: 'opacity-30',
    badgeVariant: 'secondary' as const,
  },
} as const satisfies Record<EpisodeWatchStatus, {
  label: string
  icon: typeof Clock
  color: string
  bgColor: string
  borderColor: string
  opacity: string
  badgeVariant: 'outline' | 'default' | 'secondary'
}>

/**
 * Episode-related constants
 */
export const EPISODE_CONSTANTS = {
  SPOILER_STORAGE_KEY: 'episodeSpoilerStates',
  IMAGE_SIZE: 'w500',
  GRID_BREAKPOINTS: {
    base: 'grid-cols-1',
    md: 'md:grid-cols-2',
    lg: 'lg:grid-cols-3',
  },
} as const