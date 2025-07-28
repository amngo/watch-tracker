import {
  Clock,
  Play,
  Pause,
  Check,
  X,
} from 'lucide-react'
import type { WatchStatus } from '@/types'

export const STATUS_CONFIG = {
  PLANNED: { label: 'Planned', icon: Clock },
  WATCHING: { label: 'Watching', icon: Play },
  COMPLETED: { label: 'Completed', icon: Check },
  PAUSED: { label: 'Paused', icon: Pause },
  DROPPED: { label: 'Dropped', icon: X },
} as const satisfies Record<WatchStatus, { label: string; icon: React.ComponentType<{ className?: string }> }>

export const STATUS_LABELS = {
  PLANNED: 'Planned',
  WATCHING: 'Watching', 
  COMPLETED: 'Completed',
  PAUSED: 'Paused',
  DROPPED: 'Dropped',
} as const satisfies Record<WatchStatus, string>

export const STATUS_COLORS = {
  PLANNED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  WATCHING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DROPPED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
} as const satisfies Record<WatchStatus, string>