import { Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  EPISODE_STATUS_CONFIG,
  EPISODE_CONSTANTS,
} from '@/lib/constants/episode'

import { EpisodeMetadata } from './episode-metadata'
import { EpisodeStatusBadge } from './episode-status-badge'
import { EpisodeOverview } from './episode-overview'
import { EpisodeActions } from './episode-actions'

import type { EpisodeWatchStatus, WatchedItem } from '@/types'
import { Episode, getFullImagePath } from 'tmdb-ts'

interface EpisodeCardGridProps {
  episode: Episode
  status: EpisodeWatchStatus
  showSpoilers: boolean
  individualSpoilerVisible: boolean
  onStatusChange: (status: EpisodeWatchStatus) => void
  onToggleIndividualSpoiler: () => void
  watchedItem?: WatchedItem
  showQueueButton?: boolean
}

/**
 * Grid view episode card component
 */
export function EpisodeCardGrid({
  episode,
  status,
  showSpoilers,
  individualSpoilerVisible,
  onStatusChange,
  onToggleIndividualSpoiler,
  watchedItem,
  showQueueButton = true,
}: EpisodeCardGridProps) {
  const config = EPISODE_STATUS_CONFIG[status]
  const stillUrl = getFullImagePath(
    'https://image.tmdb.org/t/p/',
    EPISODE_CONSTANTS.IMAGE_SIZE,
    episode.still_path
  )

  return (
    <Card
      className={`transition-all hover:shadow-md ${config.bgColor} ${config.borderColor} border-2 ${config.opacity}`}
    >
      <CardContent className="p-3">
        {/* Episode Still */}
        <div className="relative mb-3">
          {stillUrl ? (
            <div className="aspect-video rounded overflow-hidden">
              <img
                src={stillUrl}
                alt={episode.name}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded flex items-center justify-center">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Status Overlay */}
          <div className="absolute top-2 right-2">
            <EpisodeStatusBadge status={status} />
          </div>
        </div>

        {/* Episode Info */}
        <div className={cn('space-y-2', config.opacity)}>
          <h4 className="font-medium text-sm leading-tight">
            {episode.episode_number}. {episode.name}
          </h4>

          <EpisodeMetadata episode={episode} />

          {/* Episode Overview */}
          {episode.overview && (
            <EpisodeOverview
              overview={episode.overview}
              status={status}
              globalSpoilersVisible={showSpoilers}
              individualSpoilerVisible={individualSpoilerVisible}
              onToggleIndividualSpoiler={onToggleIndividualSpoiler}
              className="line-clamp-3"
            />
          )}

          {/* Status Actions */}
          <EpisodeActions
            status={status}
            onStatusChange={onStatusChange}
            variant="grid"
            episode={episode}
            watchedItem={watchedItem}
            showQueueButton={showQueueButton}
          />
        </div>
      </CardContent>
    </Card>
  )
}
