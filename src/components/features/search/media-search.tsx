'use client'

import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MediaPoster } from '@/components/ui/media-poster'
import { MediaTypeBadge, VoteAverageBadge } from '@/components/ui/media-badges'
import { cn, getTMDBTitle, getTMDBReleaseDate } from '@/lib/utils'
import { TMDBSearchResultItem } from '@/lib/tmdb'
import { useSearch } from '@/hooks/use-search'
import { useEffect } from 'react'
import type { MediaSearchProps, TMDBMediaItem } from '@/types'

export function MediaSearch({ onAddMedia, className }: MediaSearchProps) {
  const { query, results, isLoading, error, setQuery, clearSearch } =
    useSearch()

  const handleAddMedia = (media: TMDBMediaItem) => {
    onAddMedia(media)
    clearSearch()
  }

  useEffect(() => {
    return () => {
      clearSearch()
    }
  }, [])

  return (
    <div className={cn(className, 'h-[600px] overflow-y-auto')}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search movies and TV shows..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {query && (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-0">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results
                .filter((media): media is TMDBMediaItem => media.media_type !== 'person')
                .map(media => (
                  <Card
                    key={media.id}
                    className="transition-shadow hover:shadow-md p-0"
                  >
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

                              <Button
                                onClick={() => handleAddMedia(media)}
                                size="sm"
                                className="shrink-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
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
              )}
            </div>
          ) : query.length > 0 && !isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No results found for &quot;{query}&quot;</p>
                  <p className="text-xs">Try searching for a different title</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
