'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Star,
  Calendar,
  Clock,
  Play,
  Tv2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FlexibleEpisodeTracker } from '@/components/features/tv/flexible-episode-tracker'
import { AddToQueueButton } from '@/components/features/queue/add-to-queue-button'
import { api } from '@/trpc/react'
import { TVSeasonPageSkeleton } from '@/components/ui/skeletons'
import { useMedia } from '@/hooks/use-media'
import { calculateProgressFromWatchedItem } from '@/lib/utils'
import Link from 'next/link'
import type {
  EpisodeWatchStatus,
  WatchedItem,
  UpdateWatchedItemData,
} from '@/types'
import {
  AppendToResponse,
  Episode,
  getFullImagePath,
  SeasonDetails,
  TvShowDetails,
} from 'tmdb-ts'

export default function TVSeasonPage() {
  const params = useParams()
  const tvId = params.id as string
  const seasonNumber = parseInt(params.season_number as string)

  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null)
  const [tvShowDetails, setTvShowDetails] = useState<AppendToResponse<
    TvShowDetails,
    'credits'[],
    'tvShow'
  > | null>(null)
  const [tvShowTitle, setTvShowTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [spoilerMode, _setSpoilerMode] = useState(false)

  const {
    watchedItems,
    stats,
    updateItem,
    setStats,
    setStatsLoading,
    setWatchedItems,
    setItemsLoading,
  } = useMedia()

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

  // Fetch TV show detailed information (including seasons list)
  const { data: tvDetailsData } = api.search.tvDetails.useQuery(
    {
      id: parseInt(tvId),
      type: 'tv',
    },
    {
      enabled: !!tvId && !isNaN(parseInt(tvId)),
    }
  )

  // Fetch season details
  const {
    data: seasonDetailsData,
    isLoading: seasonLoading,
    error: seasonError,
  } = api.search.seasonDetails.useQuery(
    {
      tvId: parseInt(tvId),
      seasonNumber: seasonNumber,
    },
    {
      enabled: !!tvId && !isNaN(parseInt(tvId)) && !isNaN(seasonNumber),
    }
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

  // Set TV show details and title
  useEffect(() => {
    if (tvDetailsData) {
      const tvData = tvDetailsData as AppendToResponse<
        TvShowDetails,
        'credits'[],
        'tvShow'
      >
      setTvShowDetails(tvData)
      setTvShowTitle(tvData.name || 'Unknown Show')
    }
  }, [tvDetailsData])

  // Set season details
  useEffect(() => {
    if (seasonDetailsData) {
      setSeasonDetails(
        seasonDetailsData as AppendToResponse<
          SeasonDetails,
          'credits'[],
          'tvShow'
        >
      )
      setIsLoading(false)
    }
  }, [seasonDetailsData])

  useEffect(() => {
    if (seasonError) {
      setError('Failed to load season details')
      setIsLoading(false)
    }
  }, [seasonError])

  useEffect(() => {
    setIsLoading(seasonLoading)
  }, [seasonLoading])

  const formatRuntime = (minutes: number | null): string => {
    if (!minutes) return 'Unknown'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatAirDate = (dateString: string | null): string => {
    if (!dateString) return 'TBA'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Season navigation logic
  const getSeasonNavigation = () => {
    if (!tvShowDetails?.seasons) {
      return {
        hasPrevious: false,
        hasNext: false,
        previousSeason: null,
        nextSeason: null,
      }
    }

    // Filter out special seasons (season 0) and sort by season number
    const validSeasons = tvShowDetails.seasons
      .filter(season => season.season_number > 0)
      .sort((a, b) => a.season_number - b.season_number)

    const currentIndex = validSeasons.findIndex(
      season => season.season_number === seasonNumber
    )

    const hasPrevious = currentIndex > 0
    const hasNext = currentIndex < validSeasons.length - 1

    const previousSeason = hasPrevious ? validSeasons[currentIndex - 1] : null
    const nextSeason = hasNext ? validSeasons[currentIndex + 1] : null

    return { hasPrevious, hasNext, previousSeason, nextSeason }
  }

  const { hasPrevious, hasNext, previousSeason, nextSeason } =
    getSeasonNavigation()

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
      tvShowDetails?.number_of_seasons,
      tvShowDetails?.number_of_episodes
    )

    // Update the watched item with new episodes array and progress
    await updateItem(userWatchedItem.id, {
      watchedEpisodes: updatedWatchedEpisodes,
      progress: newProgress,
    } as UpdateWatchedItemData)
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
      tvShowDetails?.number_of_seasons,
      tvShowDetails?.number_of_episodes
    )

    // Make a single API call to update all episodes at once
    await updateItem(userWatchedItem.id, {
      watchedEpisodes: updatedWatchedEpisodes,
      progress: newProgress,
    } as UpdateWatchedItemData)
  }

  if (isLoading) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <TVSeasonPageSkeleton />
      </DashboardLayout>
    )
  }

  if (error || !seasonDetails) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Season not found</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'Unable to load season details'}
              </p>
              <Button asChild>
                <Link href={`/tv/${tvId}`}>Return to Show</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const posterUrl = seasonDetails.poster_path
    ? getFullImagePath(
        'https://image.tmdb.org/t/p/',
        'w500',
        seasonDetails.poster_path
      )
    : null

  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        {/* Season Navigation */}
        <div className="grid grid-cols-5 gap-4 items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevious}
            asChild={hasPrevious}
            className="col-span-2"
          >
            {hasPrevious ? (
              <Link
                href={`/tv/${tvId}/season/${previousSeason?.season_number}`}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {previousSeason?.name}
              </Link>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Season
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center col-span-1">
            Season {seasonNumber} of {tvShowDetails?.number_of_seasons || '?'}
          </p>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            asChild={hasNext}
            className="col-span-2"
          >
            {hasNext ? (
              <Link href={`/tv/${tvId}/season/${nextSeason?.season_number}`}>
                {nextSeason?.name}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            ) : (
              <>
                Next Season
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Season Header */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Season Poster */}
          <div className="lg:col-span-1">
            {posterUrl ? (
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                <img
                  src={posterUrl}
                  alt={seasonDetails.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <Tv2 className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Season Info */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{seasonDetails.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {seasonDetails.air_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatAirDate(seasonDetails.air_date)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {seasonDetails.episodes.length} episodes
                  </span>
                </div>
                {/* {seasonDetails.vote_average && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {seasonDetails.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                )} */}
              </div>

              {seasonDetails.overview && (
                <p className="text-muted-foreground leading-relaxed">
                  {seasonDetails.overview}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Episode Tracker */}
        {userWatchedItem && (
          <FlexibleEpisodeTracker
            watchedItem={userWatchedItem}
            seasonDetails={seasonDetails}
            onUpdateEpisodeStatus={handleUpdateEpisodeStatus}
            onBulkUpdateEpisodes={handleBulkUpdateEpisodes}
          />
        )}

        {/* Episodes List (for non-tracked shows) */}
        {!userWatchedItem && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Episodes</h2>
            <div className="space-y-4">
              {seasonDetails.episodes.map((episode: Episode) => {
                const stillUrl = episode.still_path
                  ? getFullImagePath(
                      'https://image.tmdb.org/t/p/',
                      'w500',
                      episode.still_path
                    )
                  : null

                return (
                  <Card key={episode.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                        {/* Episode Still */}
                        <div className="md:col-span-1">
                          {stillUrl ? (
                            <div className="aspect-video relative">
                              <img
                                src={stillUrl}
                                alt={episode.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-muted flex items-center justify-center">
                              <Tv2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Episode Details */}
                        <div className="md:col-span-3 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                <Link
                                  href={`/tv/${tvId}/season/${seasonNumber}/episode/${episode.episode_number}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {episode.episode_number}. {episode.name}
                                </Link>
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                                {episode.air_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {formatAirDate(episode.air_date)}
                                    </span>
                                  </div>
                                )}
                                {episode.runtime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {formatRuntime(episode.runtime)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  <span>
                                    {episode.vote_average.toFixed(1)}/10
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Episode Overview */}
                          {episode.overview && (
                            <div className="mb-4">
                              {spoilerMode ? (
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {episode.overview}
                                </p>
                              ) : (
                                <div className="relative">
                                  <p className="text-muted-foreground text-sm leading-relaxed blur-sm select-none">
                                    {episode.overview}
                                  </p>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Badge variant="outline">
                                      Spoiler Hidden
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Guest Stars */}
                          {episode.guest_stars &&
                            episode.guest_stars.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                  GUEST STARS
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {episode.guest_stars
                                    .slice(0, 5)
                                    .map(guest => (
                                      <Badge key={guest.id} variant="secondary">
                                        {guest.name}
                                      </Badge>
                                    ))}
                                  {episode.guest_stars.length > 5 && (
                                    <Badge variant="outline">
                                      +{episode.guest_stars.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Queue Action */}
                          <div className="flex justify-end">
                            <AddToQueueButton
                              tmdbItem={{
                                id: parseInt(tvId),
                                media_type: 'tv',
                                name: tvShowTitle,
                                poster_path: tvShowDetails?.poster_path || '',
                                first_air_date:
                                  tvShowDetails?.first_air_date || '',
                                overview: tvShowDetails?.overview || '',
                                vote_average: tvShowDetails?.vote_average || 0,
                                adult: false,
                                vote_count: 0,
                              }}
                              seasonNumber={episode.season_number}
                              episodeNumber={episode.episode_number}
                              size="sm"
                              variant="outline"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
