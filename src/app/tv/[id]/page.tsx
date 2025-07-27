'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Tv2,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MediaSearch } from '@/components/features/search/media-search'
import { FlexibleSeasonOverview } from '@/components/features/tv/flexible-season-overview'
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
import { TMDBService } from '@/lib/tmdb'
import { calculateProgressFromWatchedItem } from '@/lib/utils'
import Link from 'next/link'
import type {
  TMDBTVDetailsExtended,
  TMDBMediaItem,
  EpisodeWatchStatus,
  WatchStatus,
  WatchedItem,
} from '@/types'

export default function TVDetailPage() {
  const params = useParams()
  const tvId = params.id as string
  const [tvDetails, setTvDetails] = useState<TMDBTVDetailsExtended | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    watchedItems,
    stats,
    addMedia,
    updateItem,
    setStats,
    setStatsLoading,
    setWatchedItems,
    setItemsLoading,
  } = useMedia()

  const { isSearchModalOpen, openSearchModal, closeSearchModal } = useUI()

  // Fetch user stats
  const { data: statsData, isLoading: statsDataLoading } =
    api.user.getStats.useQuery()

  // Fetch user's watched items to ensure we have the latest data
  const { data: watchedItemsData, isLoading: watchedItemsLoading } =
    api.watchedItem.getAll.useQuery({
      limit: 100,
    })

  // Get user's watch information for this TV show
  const userWatchedItem = watchedItems.find(
    item => item.tmdbId === parseInt(tvId) && item.mediaType === 'TV'
  )

  // Sync stats
  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
    setStatsLoading(statsDataLoading)
  }, [statsData, statsDataLoading, setStats, setStatsLoading])

  // Sync watched items
  useEffect(() => {
    if (watchedItemsData?.items) {
      setWatchedItems(
        watchedItemsData.items.map(item => ({
          id: item.id,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          poster: item.poster,
          releaseDate: item.releaseDate,
          status: item.status,
          rating: item.rating,
          currentEpisode: item.currentEpisode,
          totalEpisodes: item.totalEpisodes,
          currentSeason: item.currentSeason,
          totalSeasons: item.totalSeasons,
          currentRuntime: item.currentRuntime,
          totalRuntime: item.totalRuntime,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          startDate: item.startDate,
          finishDate: item.finishDate,
          notes: item.notes || [],
          _count: item._count,
          watchedEpisodes: item.watchedEpisodes || [],
          progress: calculateProgressFromWatchedItem(
            {
              ...item,
              watchedEpisodes: item.watchedEpisodes || [],
              progress: 0, // Temporary placeholder, will be calculated
            } as WatchedItem,
            item.totalSeasons ?? undefined,
            item.totalEpisodes ?? undefined
          ),
        }))
      )
    }
    setItemsLoading(watchedItemsLoading)
  }, [watchedItemsData, watchedItemsLoading, setWatchedItems, setItemsLoading])

  // Fetch detailed TV show information with cast/crew
  const {
    data: tvDetailsData,
    isLoading: detailsLoading,
    error: detailsError,
  } = api.search.detailsExtended.useQuery(
    {
      id: parseInt(tvId),
      type: 'tv',
    },
    {
      enabled: !!tvId && !isNaN(parseInt(tvId)),
    }
  )

  useEffect(() => {
    if (tvDetailsData) {
      setTvDetails(tvDetailsData as TMDBTVDetailsExtended)
      setIsLoading(false)
    }
  }, [tvDetailsData])

  useEffect(() => {
    if (detailsError) {
      setError('Failed to load TV show details')
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

  const handleUpdateProgress = async (data: {
    currentSeason: number
    currentEpisode: number
    status?: WatchStatus
    finishDate?: Date
  }) => {
    if (userWatchedItem) {
      await updateItem(userWatchedItem.id, data)
    }
  }

  const handleUpdateEpisodeStatus = async (
    seasonNumber: number,
    episodeNumber: number,
    status: EpisodeWatchStatus
  ) => {
    if (!userWatchedItem) return

    // For now, we'll update the existing watched episodes array manually
    // This should be replaced with a proper TRPC mutation
    const updatedWatchedEpisodes = [...(userWatchedItem.watchedEpisodes || [])]

    // Find existing episode or create new one
    const existingIndex = updatedWatchedEpisodes.findIndex(
      ep =>
        ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
    )

    if (existingIndex >= 0) {
      // Update existing episode
      updatedWatchedEpisodes[existingIndex] = {
        ...updatedWatchedEpisodes[existingIndex],
        status,
        watchedAt: status === 'WATCHED' ? new Date() : null,
      }
    } else {
      // Add new episode
      updatedWatchedEpisodes.push({
        id: `temp-${seasonNumber}-${episodeNumber}`,
        seasonNumber,
        episodeNumber,
        status,
        watchedAt: status === 'WATCHED' ? new Date() : null,
        watchedItemId: userWatchedItem.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Calculate new progress based on updated episodes
    const newProgress = calculateProgressFromWatchedItem(
      {
        ...userWatchedItem,
        watchedEpisodes: updatedWatchedEpisodes,
      },
      tvDetails?.number_of_seasons,
      tvDetails?.number_of_episodes
    )

    // Update the watched item with new episodes array and progress
    await updateItem(userWatchedItem.id, {
      watchedEpisodes: updatedWatchedEpisodes,
      progress: newProgress,
    } as any)
  }

  const handleBulkUpdateEpisodes = async (
    episodes: {
      seasonNumber: number
      episodeNumber: number
      status: EpisodeWatchStatus
    }[]
  ) => {
    if (!userWatchedItem) return

    // Start with a copy of existing watched episodes
    const updatedWatchedEpisodes = [...(userWatchedItem.watchedEpisodes || [])]

    // Process all episode updates in memory first
    episodes.forEach(({ seasonNumber, episodeNumber, status }) => {
      const existingIndex = updatedWatchedEpisodes.findIndex(
        ep =>
          ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
      )

      if (existingIndex >= 0) {
        // Update existing episode
        updatedWatchedEpisodes[existingIndex] = {
          ...updatedWatchedEpisodes[existingIndex],
          status,
          watchedAt: status === 'WATCHED' ? new Date() : null,
        }
      } else {
        // Add new episode
        updatedWatchedEpisodes.push({
          id: `temp-${seasonNumber}-${episodeNumber}`,
          seasonNumber,
          episodeNumber,
          status,
          watchedAt: status === 'WATCHED' ? new Date() : null,
          watchedItemId: userWatchedItem.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    })

    // Calculate new progress based on updated episodes
    const newProgress = calculateProgressFromWatchedItem(
      {
        ...userWatchedItem,
        watchedEpisodes: updatedWatchedEpisodes,
      },
      tvDetails?.number_of_seasons,
      tvDetails?.number_of_episodes
    )

    // Make a single API call to update all episodes at once
    await updateItem(userWatchedItem.id, {
      watchedEpisodes: updatedWatchedEpisodes,
      progress: newProgress,
    } as any)
  }

  const formatRuntime = (minutes: number[] | undefined): string => {
    if (!minutes || minutes.length === 0) return 'Unknown'
    const avgRuntime = minutes.reduce((a, b) => a + b, 0) / minutes.length
    const hours = Math.floor(avgRuntime / 60)
    const mins = Math.round(avgRuntime % 60)
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (isLoading) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tv">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to TV Shows
              </Link>
            </Button>
          </div>
          <LoadingCard />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !tvDetails) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tv">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to TV Shows
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  TV show not found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {error || 'Unable to load TV show details'}
                </p>
                <Button asChild>
                  <Link href="/tv">Return to TV Shows</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const backdropUrl = tvDetails.backdrop_path
    ? TMDBService.getBackdropUrl(tvDetails.backdrop_path, 'w1280')
    : null

  const posterUrl = tvDetails.poster_path
    ? TMDBService.getPosterUrl(tvDetails.poster_path, 'w500')
    : null

  const mainCast = tvDetails.credits?.cast.slice(0, 8) || []
  const creators = tvDetails.created_by || []
  const executiveProducers =
    tvDetails.credits?.crew
      .filter(member => member.job === 'Executive Producer')
      .slice(0, 3) || []

  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tv">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to TV Shows
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
                alt={tvDetails.name}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}
        </div>

        {/* TV Show Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster and Basic Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {posterUrl && (
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  <img
                    src={posterUrl}
                    alt={tvDetails.name}
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
                    {userWatchedItem.currentSeason &&
                      userWatchedItem.currentEpisode && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Progress
                          </span>
                          <span className="text-sm font-medium">
                            S{userWatchedItem.currentSeason}E
                            {userWatchedItem.currentEpisode}
                          </span>
                        </div>
                      )}
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
                        Completion
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
                        <Link href={`/tv/${tvId}/notes`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Notes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Show Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Show Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tvDetails.number_of_seasons && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Seasons
                      </span>
                      <span className="text-sm font-medium">
                        {tvDetails.number_of_seasons}
                      </span>
                    </div>
                  )}
                  {tvDetails.number_of_episodes && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Episodes
                      </span>
                      <span className="text-sm font-medium">
                        {tvDetails.number_of_episodes}
                      </span>
                    </div>
                  )}
                  {tvDetails.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge variant="outline">{tvDetails.status}</Badge>
                    </div>
                  )}
                  {tvDetails.type && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Type
                      </span>
                      <span className="text-sm font-medium">
                        {tvDetails.type}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Overview */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{tvDetails.name}</h1>
              {tvDetails.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">
                  {tvDetails.tagline}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {tvDetails.first_air_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(tvDetails.first_air_date).getFullYear()}
                      {tvDetails.last_air_date &&
                        tvDetails.status === 'Ended' &&
                        ` - ${new Date(tvDetails.last_air_date).getFullYear()}`}
                    </span>
                  </div>
                )}
                {tvDetails.episode_run_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatRuntime(tvDetails.episode_run_time)} per episode
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {tvDetails.vote_average.toFixed(1)}/10
                  </span>
                </div>
              </div>

              {/* Genres */}
              {tvDetails.genres && tvDetails.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tvDetails.genres.map(genre => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              {tvDetails.overview && (
                <p className="text-muted-foreground leading-relaxed">
                  {tvDetails.overview}
                </p>
              )}
            </div>

            {/* Key Personnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creators.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      CREATED BY
                    </h4>
                    <p className="font-medium">
                      {creators.map(creator => creator.name).join(', ')}
                    </p>
                  </CardContent>
                </Card>
              )}
              {executiveProducers.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      EXECUTIVE PRODUCERS
                    </h4>
                    <p className="font-medium">
                      {executiveProducers
                        .map(producer => producer.name)
                        .join(', ')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Seasons */}
        {userWatchedItem &&
          tvDetails.seasons &&
          tvDetails.seasons.length > 0 && (
            <FlexibleSeasonOverview
              watchedItem={userWatchedItem}
              tvDetails={tvDetails}
              onUpdateEpisodeStatus={handleUpdateEpisodeStatus}
              onBulkUpdateEpisodes={handleBulkUpdateEpisodes}
            />
          )}

        {/* Basic Seasons List (for non-tracked shows) */}
        {!userWatchedItem &&
          tvDetails.seasons &&
          tvDetails.seasons.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Seasons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tvDetails.seasons.map(season => (
                  <Card
                    key={season.id}
                    className="p-0 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Link href={`/tv/${tvId}/season/${season.season_number}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {season.poster_path ? (
                            <div className="w-16 h-20 relative rounded overflow-hidden flex-shrink-0">
                              <img
                                src={
                                  TMDBService.getPosterUrl(
                                    season.poster_path,
                                    'w185'
                                  ) || ''
                                }
                                alt={season.name}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                              <Tv2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight mb-1 hover:text-primary transition-colors">
                              {season.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {season.episode_count} episodes
                            </p>
                            {season.air_date && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(season.air_date).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

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

        {/* Networks & Production */}
        {tvDetails.networks && tvDetails.networks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Networks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tvDetails.networks.map(network => (
                <Card key={network.id}>
                  <CardContent className="p-4">
                    <h4 className="font-medium">{network.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {network.origin_country}
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
