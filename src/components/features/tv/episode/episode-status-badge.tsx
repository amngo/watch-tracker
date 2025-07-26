import { Badge } from '@/components/ui/badge'
import { EPISODE_STATUS_CONFIG } from '@/lib/constants/episode'
import type { EpisodeWatchStatus } from '@/types'

interface EpisodeStatusBadgeProps {
  status: EpisodeWatchStatus
  className?: string
}

/**
 * Badge component displaying episode watch status
 */
export function EpisodeStatusBadge({ status, className = '' }: EpisodeStatusBadgeProps) {
  const config = EPISODE_STATUS_CONFIG[status]

  return (
    <Badge variant={config.badgeVariant} className={`text-xs ${className}`}>
      <config.icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}