import { Play, Check, Star, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatAirDate, formatRuntime } from '@/lib/format'
import { Episode, getFullImagePath } from 'tmdb-ts'
import { EPISODE_CONSTANTS } from '@/lib/constants/episode'

interface EpisodeItemProps {
  episode: Episode
  isWatched: boolean
  isCurrent: boolean
  onMarkWatched: (episodeNumber: number) => void
  onMarkAsCurrentEpisode: (episodeNumber: number) => void
}

export function EpisodeItem({
  episode,
  isWatched,
  isCurrent,
  onMarkWatched,
  onMarkAsCurrentEpisode,
}: EpisodeItemProps) {
  const stillUrl = getFullImagePath(
    'https://image.tmdb.org/t/p/',
    EPISODE_CONSTANTS.IMAGE_SIZE,
    episode.still_path
  )

  return (
    <Card
      className={`transition-all ${isCurrent ? 'ring-2 ring-primary' : ''} ${isWatched ? 'opacity-75' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Episode Still */}
          <div className="relative flex-shrink-0 w-24 h-16 rounded overflow-hidden">
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
            {isWatched && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
            )}
            {isCurrent && !isWatched && (
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
            )}
          </div>

          {/* Episode Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm leading-tight mb-1">
                  {episode.episode_number}. {episode.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  {episode.air_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatAirDate(episode.air_date)}</span>
                    </div>
                  )}
                  {episode.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatRuntime(episode.runtime)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{episode.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                {episode.overview && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {episode.overview}
                  </p>
                )}
              </div>

              {/* Episode Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isWatched && (
                  <Button
                    size="sm"
                    variant={isCurrent ? 'default' : 'outline'}
                    onClick={() =>
                      onMarkAsCurrentEpisode(episode.episode_number)
                    }
                    className="text-xs px-2 py-1 h-auto"
                  >
                    {isCurrent ? 'Current' : 'Set Current'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isWatched ? 'secondary' : 'default'}
                  onClick={() => onMarkWatched(episode.episode_number)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {isWatched ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Watched
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Mark Watched
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
