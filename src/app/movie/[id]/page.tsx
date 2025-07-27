'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Star, Calendar, Clock, Plus, Edit3, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MediaSearch } from '@/components/features/search/media-search'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/trpc/react'
import { LoadingCard } from '@/components/common/loading-spinner'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import { TMDBService, tmdbService } from '@/lib/tmdb'
import Link from 'next/link'
import Image from 'next/image'
import type { TMDBMovieDetailsExtended, TMDBMediaItem } from '@/types'

export default function MovieDetailPage() {
  const params = useParams()
  const movieId = params.id as string
  const [movieDetails, setMovieDetails] =
    useState<TMDBMovieDetailsExtended | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { watchedItems, stats, addMedia, setStats, setStatsLoading } =
    useMedia()

  const { isSearchModalOpen, openSearchModal, closeSearchModal } = useUI()

  // Fetch user stats
  const { data: statsData, isLoading: statsDataLoading } =
    api.user.getStats.useQuery()

  // Get user's watch information for this movie
  const userWatchedItem = watchedItems.find(
    item => item.tmdbId === parseInt(movieId) && item.mediaType === 'MOVIE'
  )

  // Sync stats
  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
    setStatsLoading(statsDataLoading)
  }, [statsData, statsDataLoading, setStats, setStatsLoading])

  // Fetch detailed movie information with cast/crew
  const {
    data: movieDetailsData,
    isLoading: detailsLoading,
    error: detailsError,
  } = api.search.detailsExtended.useQuery(
    {
      id: parseInt(movieId),
      type: 'movie',
    },
    {
      enabled: !!movieId && !isNaN(parseInt(movieId)),
    }
  )

  useEffect(() => {
    if (movieDetailsData) {
      setMovieDetails(movieDetailsData as TMDBMovieDetailsExtended)
      setIsLoading(false)
    }
  }, [movieDetailsData])

  useEffect(() => {
    if (detailsError) {
      setError('Failed to load movie details')
      setIsLoading(false)
    }
  }, [detailsError])

  useEffect(() => {
    setIsLoading(detailsLoading)
  }, [detailsLoading])

  const handleAddToWatchlist = async (media: TMDBMediaItem) => {
    await addMedia(media)
    closeSearchModal()
  }

  const formatRuntime = (minutes: number | null): string => {
    if (!minutes) return 'Unknown'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/movies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Movies
              </Link>
            </Button>
          </div>
          <LoadingCard />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !movieDetails) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/movies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Movies
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Movie not found</h3>
                <p className="text-muted-foreground mb-4">
                  {error || 'Unable to load movie details'}
                </p>
                <Button asChild>
                  <Link href="/movies">Return to Movies</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const backdropUrl = movieDetails.backdrop_path
    ? TMDBService.getBackdropUrl(movieDetails.backdrop_path, 'w1280')
    : null

  const posterUrl = movieDetails.poster_path
    ? TMDBService.getPosterUrl(movieDetails.poster_path, 'w500')
    : null

  const mainCast = movieDetails.credits?.cast.slice(0, 8) || []
  const director = movieDetails.credits?.crew.find(
    member => member.job === 'Director'
  )
  const writers =
    movieDetails.credits?.crew
      .filter(
        member =>
          member.job === 'Writer' ||
          member.job === 'Screenplay' ||
          member.job === 'Story'
      )
      .slice(0, 3) || []

  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/movies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Movies
            </Link>
          </Button>

          <Dialog
            open={isSearchModalOpen}
            onOpenChange={open => !open && closeSearchModal()}
          >
            <Button onClick={openSearchModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Watchlist
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Search & Add Media</DialogTitle>
              </DialogHeader>
              <MediaSearch onAddMedia={handleAddToWatchlist} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Hero Section */}
        <div className="relative">
          {backdropUrl && (
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
              <img
                src={backdropUrl}
                alt={movieDetails.title}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}
        </div>

        {/* Movie Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster and Basic Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {posterUrl && (
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  <img
                    src={posterUrl}
                    alt={movieDetails.title}
                    className="object-cover"
                  />
                </div>
              )}

              {/* User Watch Status */}
              {userWatchedItem && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge variant="outline">{userWatchedItem.status}</Badge>
                    </div>
                    {userWatchedItem.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Your Rating
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {userWatchedItem.rating}/10
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Progress
                      </span>
                      <span className="text-sm font-medium">
                        {userWatchedItem.progress}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Could open a quick edit dialog here
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Update Progress
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <Link href={`/movie/${movieId}/notes`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Notes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Overview */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{movieDetails.title}</h1>
              {movieDetails.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">
                  {movieDetails.tagline}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {movieDetails.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(movieDetails.release_date).getFullYear()}
                    </span>
                  </div>
                )}
                {movieDetails.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatRuntime(movieDetails.runtime)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {movieDetails.vote_average.toFixed(1)}/10
                  </span>
                </div>
              </div>

              {/* Genres */}
              {movieDetails.genres && movieDetails.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movieDetails.genres.map(genre => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movieDetails.overview && (
                <p className="text-muted-foreground leading-relaxed">
                  {movieDetails.overview}
                </p>
              )}
            </div>

            {/* Key Personnel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {director && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      DIRECTOR
                    </h4>
                    <p className="font-medium">{director.name}</p>
                  </CardContent>
                </Card>
              )}
              {writers.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      WRITERS
                    </h4>
                    <p className="font-medium">
                      {writers.map(writer => writer.name).join(', ')}
                    </p>
                  </CardContent>
                </Card>
              )}
              {movieDetails.budget && movieDetails.budget > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      BUDGET
                    </h4>
                    <p className="font-medium">
                      {formatCurrency(movieDetails.budget)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {mainCast.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {mainCast.map(castMember => (
                <Card key={castMember.id} className="p-0">
                  <CardContent className="p-4 flex gap-4">
                    {castMember.profile_path ? (
                      <div className="relative rounded-lg overflow-hidden w-16 h-auto">
                        <img
                          src={
                            TMDBService.getPosterUrl(
                              castMember.profile_path,
                              'w185'
                            ) || ''
                          }
                          alt={castMember.name}
                          className="object-cover object-top w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg flex items-center justify-center w-16 h-auto">
                        <span className="text-muted-foreground text-xs">
                          No Photo
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-sm leading-tight mb-1">
                        {castMember.name}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {castMember.character}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Production Details */}
        {movieDetails.production_companies &&
          movieDetails.production_companies.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Production</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {movieDetails.production_companies.map(company => (
                  <Card key={company.id} className="p-0">
                    <CardContent className="p-4 flex flex-col items-center">
                      {/* {company.logo_path && (
                        <div className="relative overflow-hidden">
                          <img
                            src={
                              TMDBService.getImageUrl(
                                company.logo_path,
                                'original'
                              ) || ''
                            }
                            alt={company.name}
                            className="object-contain"
                          />
                        </div>
                      )} */}

                      <h4 className="font-medium mt-2">{company.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {company.origin_country}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
      </div>
    </DashboardLayout>
  )
}
