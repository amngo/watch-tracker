import { Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TMDBService } from '@/lib/tmdb'
import { cn } from '@/lib/utils'
import { EPISODE_STATUS_CONFIG, EPISODE_CONSTANTS } from '@/lib/constants/episode'

import { EpisodeMetadata } from './episode-metadata'
import { EpisodeStatusBadge } from './episode-status-badge'
import { EpisodeOverview } from './episode-overview'
import { EpisodeActions } from './episode-actions'

import type { TMDBEpisodeItem, EpisodeWatchStatus } from '@/types'

interface EpisodeCardListProps {
  episode: TMDBEpisodeItem
  status: EpisodeWatchStatus
  showSpoilers: boolean
  individualSpoilerVisible: boolean
  onStatusChange: (status: EpisodeWatchStatus) => void
  onToggleIndividualSpoiler: () => void
}

/**
 * List view episode card component
 */
export function EpisodeCardList({
  episode,
  status,
  showSpoilers,
  individualSpoilerVisible,
  onStatusChange,
  onToggleIndividualSpoiler,
}: EpisodeCardListProps) {
  const config = EPISODE_STATUS_CONFIG[status]
  const stillUrl = episode.still_path
    ? TMDBService.getImageUrl(episode.still_path, EPISODE_CONSTANTS.IMAGE_SIZE)
    : null

  return (
    <Card
      className={`transition-all hover:shadow-sm ${config.bgColor} ${config.borderColor} border-l-4`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Episode Still */}
          <div
            className={cn(
              'relative flex-shrink-0 w-24 h-16 rounded overflow-hidden',
              config.opacity
            )}
          >
            {stillUrl ? (
              <img
                src={stillUrl}
                alt={episode.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="bg-muted flex items-center justify-center w-full h-full">
                <Play className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Episode Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className={cn('min-w-0 flex-1', config.opacity)}>
                <h4 className="font-medium text-sm leading-tight mb-1">
                  {episode.episode_number}. {episode.name}
                </h4>

                <EpisodeMetadata episode={episode} className="mb-2" />

                {episode.overview && (
                  <EpisodeOverview
                    overview={episode.overview}
                    status={status}
                    globalSpoilersVisible={showSpoilers}
                    individualSpoilerVisible={individualSpoilerVisible}
                    onToggleIndividualSpoiler={onToggleIndividualSpoiler}
                    className="line-clamp-2 leading-relaxed"
                  />
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <EpisodeStatusBadge status={status} />
                <EpisodeActions
                  status={status}
                  onStatusChange={onStatusChange}
                  variant="list"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}