import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MediaPoster } from '@/components/ui/media-poster'
import { MediaTypeBadge, VoteAverageBadge } from '@/components/ui/media-badges'
import { AddToQueueButton } from '@/components/features/queue/add-to-queue-button'
import { getTMDBTitle, getTMDBReleaseDate } from '@/lib/utils'
import type { TMDBMediaItem } from '@/types'

interface MediaResultCardProps {
  media: TMDBMediaItem
  isInWatchlist: boolean
  onAddMedia: (media: TMDBMediaItem) => Promise<void>
}

export function MediaResultCard({
  media,
  isInWatchlist,
  onAddMedia,
}: MediaResultCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md p-0">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <MediaPoster
            src={media.poster_path}
            alt={getTMDBTitle(media)}
            mediaType={media.media_type}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg leading-tight">
                  {getTMDBTitle(media)}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <MediaTypeBadge mediaType={media.media_type} />
                  <span className="text-xs text-muted-foreground">
                    {getTMDBReleaseDate(media)}
                  </span>
                  <VoteAverageBadge rating={media.vote_average} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => !isInWatchlist && onAddMedia(media)}
                  size="sm"
                  className="shrink-0"
                  disabled={isInWatchlist}
                  variant={isInWatchlist ? 'secondary' : 'default'}
                >
                  {isInWatchlist ? '✓ Added' : '+ Add'}
                </Button>
                
                <AddToQueueButton
                  tmdbItem={media}
                  size="sm"
                  variant="outline"
                />
              </div>
            </div>

            {media.overview && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {media.overview}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}