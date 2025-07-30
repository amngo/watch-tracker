'use client'
import { Play, Clock, Film, Tv } from 'lucide-react'
import { useQueue } from '@/hooks/use-queue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export function UpNext() {
  const { queueItems, isLoadingQueue, markAsWatched } = useQueue()

  // Get the first unwatched item (next up)
  const nextItem = queueItems.find(item => !item.watched)

  if (isLoadingQueue) {
    return (
      <Card className="p-3 gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Up Next
          </span>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-12 h-16 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </Card>
    )
  }

  if (!nextItem) {
    return (
      <Card className="p-3 gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Up Next
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your queue is empty. Add items to see what&apos;s up next!
        </p>
        <Button asChild size="sm" className="w-full">
          <Link href="/search">Browse & Add</Link>
        </Button>
      </Card>
    )
  }

  const isEpisode =
    nextItem.contentType === 'TV' &&
    nextItem.seasonNumber &&
    nextItem.episodeNumber
  const displayTitle = isEpisode ? `${nextItem.title}` : nextItem.title

  const subtitle = isEpisode
    ? `S${nextItem.seasonNumber?.toString().padStart(2, '0')}E${nextItem.episodeNumber?.toString().padStart(2, '0')}${nextItem.episodeName ? ` • ${nextItem.episodeName}` : ''}`
    : `${nextItem.contentType === 'MOVIE' ? 'Movie' : 'TV Show'}`

  const detailUrl =
    nextItem.contentType === 'MOVIE'
      ? `/movie/${nextItem.tmdbId}`
      : `/tv/${nextItem.tmdbId}`

  return (
    <Card className="p-3 gap-2">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Up Next
        </span>
      </div>

      <div className="flex gap-2">
        {/* Poster */}
        <Link href={detailUrl} className="block shrink-0">
          <div className="relative w-12 h-16 rounded overflow-hidden bg-muted">
            {nextItem.poster ? (
              <img
                src={`https://image.tmdb.org/t/p/w92${nextItem.poster}`}
                alt={nextItem.title}
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {nextItem.contentType === 'MOVIE' ? (
                  <Film className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Tv className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={detailUrl} className="block">
            <h4 className="text-xs font-medium line-clamp-1 hover:text-primary transition-colors">
              {displayTitle}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {subtitle}
            </p>
          </Link>

          {/* Action Button */}
          <Button
            size="sm"
            className="h-6 px-2 text-xs mt-1"
            onClick={() => markAsWatched(nextItem.id)}
          >
            <Play className="h-3 w-3 mr-1" />
            Mark Watched
          </Button>
        </div>
      </div>

      {/* Queue position indicator */}
      <div className="text-xs text-muted-foreground">
        Position #{nextItem.position} •{' '}
        {queueItems.filter(item => !item.watched).length} in queue
      </div>
    </Card>
  )
}
