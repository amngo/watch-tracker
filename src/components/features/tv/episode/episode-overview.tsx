import { SpoilerToggle } from './spoiler-toggle'
import type { EpisodeWatchStatus } from '@/types'

interface EpisodeOverviewProps {
  overview: string
  status: EpisodeWatchStatus
  globalSpoilersVisible: boolean
  individualSpoilerVisible: boolean
  onToggleIndividualSpoiler: () => void
  className?: string
}

/**
 * Component for displaying episode overview with spoiler protection
 */
export function EpisodeOverview({
  overview,
  status,
  globalSpoilersVisible,
  individualSpoilerVisible,
  onToggleIndividualSpoiler,
  className = '',
}: EpisodeOverviewProps) {
  const shouldShowSpoilers =
    status === 'WATCHED' || globalSpoilersVisible || individualSpoilerVisible

  const showToggle = status !== 'WATCHED'

  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p
            className={`line-clamp-3 ${
              !shouldShowSpoilers ? 'blur-sm select-none' : ''
            }`}
          >
            {overview}
          </p>
        </div>
        {showToggle && (
          <SpoilerToggle
            isVisible={individualSpoilerVisible}
            onToggle={onToggleIndividualSpoiler}
          />
        )}
      </div>
    </div>
  )
}
