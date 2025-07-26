import { Progress } from '@/components/ui/progress'
import {
  calculateProgress,
  formatEpisodeCount,
  formatRuntime,
} from '@/lib/utils'
import type { WatchStatus } from '@/types'

interface ProgressDisplayProps {
  status: WatchStatus
  mediaType: 'MOVIE' | 'TV'
  currentEpisode?: number | null
  totalEpisodes?: number | null
  currentSeason?: number | null
  currentRuntime?: number | null
  totalRuntime?: number | null
  className?: string
}

export function ProgressDisplay({
  status,
  mediaType,
  currentEpisode,
  totalEpisodes,
  currentSeason,
  currentRuntime,
  totalRuntime,
  className,
}: ProgressDisplayProps) {
  const progressPercentage = calculateProgress(
    status,
    currentEpisode,
    totalEpisodes,
    currentRuntime,
    totalRuntime
  )

  const getProgressText = () => {
    if (status === 'COMPLETED') return 'Completed'
    if (status === 'PLANNED') return 'Not started'

    if (mediaType === 'TV') {
      if (currentSeason && currentEpisode) {
        return `S${currentSeason}E${currentEpisode}`
      }
      if (currentEpisode && totalEpisodes) {
        return formatEpisodeCount(currentEpisode, totalEpisodes)
      }
      return 'In progress'
    }

    if (mediaType === 'MOVIE' && currentRuntime && totalRuntime) {
      return `${formatRuntime(currentRuntime)} / ${formatRuntime(totalRuntime)}`
    }

    return 'In progress'
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">
          {getProgressText()}
        </span>
        <span className="text-sm font-medium">{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  )
}
