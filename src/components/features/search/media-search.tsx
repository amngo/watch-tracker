'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Film, Tv } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { api } from '@/trpc/react'

interface TMDBResult {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path?: string
  release_date?: string
  first_air_date?: string
  media_type: 'movie' | 'tv'
  vote_average: number
}

interface MediaSearchProps {
  onAddMedia: (media: TMDBResult) => void
  className?: string
}

export function MediaSearch({ onAddMedia, className }: MediaSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  // Mock TMDB search - In production, this would call TMDB API
  const searchMedia = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock results - replace with actual TMDB API call
    const mockResults: TMDBResult[] = [
      {
        id: 550,
        title: 'Fight Club',
        overview:
          'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression...',
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        release_date: '1999-10-15',
        media_type: 'movie' as const,
        vote_average: 8.4,
      },
      {
        id: 1399,
        name: 'Game of Thrones',
        overview:
          'Seven noble families fight for control of the mythical land of Westeros...',
        poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
        first_air_date: '2011-04-17',
        media_type: 'tv' as const,
        vote_average: 9.3,
      },
    ].filter(item =>
      (item.title || item.name)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    )

    setResults(mockResults)
    setIsSearching(false)
  }

  // Search when debounced query changes
  useMemo(() => {
    searchMedia(debouncedQuery)
  }, [debouncedQuery])

  const handleAddMedia = (media: TMDBResult) => {
    onAddMedia(media)
    setQuery('')
    setResults([])
  }

  return (
    <div className={className}>
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
          {isSearching ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
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
              {results.map(media => (
                <Card
                  key={media.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-16 rounded bg-muted flex items-center justify-center">
                        {media.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${media.poster_path}`}
                            alt={media.title || media.name}
                            className="h-full w-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-muted-foreground">
                            {media.media_type === 'movie' ? (
                              <Film className="h-8 w-8" />
                            ) : (
                              <Tv className="h-8 w-8" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-lg leading-tight">
                              {media.title || media.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  media.media_type === 'movie'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {media.media_type === 'movie'
                                  ? 'Movie'
                                  : 'TV Show'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {media.release_date || media.first_air_date}
                              </span>
                              <Badge variant="outline">
                                ⭐ {media.vote_average.toFixed(1)}
                              </Badge>
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
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {media.overview}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : query.length > 0 && !isSearching ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No results found for &quot;{query}&quot;</p>
                  <p className="text-sm">Try searching for a different title</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
