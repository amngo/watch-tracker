'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Tv2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  Circle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AddToQueueButton } from '@/components/features/queue/add-to-queue-button'
import { api } from '@/trpc/react'
import { LoadingCard } from '@/components/common/loading-spinner'
import { useMedia } from '@/hooks/use-media'
import { TMDBService } from '@/lib/tmdb'
import { calculateProgressFromWatchedItem } from '@/lib/utils'
import Link from 'next/link'
import type {
  TMDBTVDetailsExtended,
  TMDBSeasonDetailsItem,
  EpisodeWatchStatus,
  WatchedItem,
  UpdateWatchedItemData,
} from '@/types'
import type { TMDBEpisode, TMDBCastMember, TMDBCrewMember } from '@/lib/tmdb'

export default function TVEpisodePage() {
  const params = useParams()
  const tvId = params.id as string
  const seasonNumber = parseInt(params.season_number as string)
  const episodeNumber = parseInt(params.episode_number as string)

  const [episodeDetails, setEpisodeDetails] = useState<TMDBEpisode | null>(null)
  const [tvShowDetails, setTvShowDetails] =
    useState<TMDBTVDetailsExtended | null>(null)
  const [seasonDetails, setSeasonDetails] =
    useState<TMDBSeasonDetailsItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [spoilerMode, setSpoilerMode] = useState(false)

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

  // Get the current episode's watch status
  const currentEpisodeWatchStatus =
    userWatchedItem?.watchedEpisodes?.find(
      ep =>
        ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
    )?.status || 'UNWATCHED'

  // Fetch TV show detailed information
  const { data: tvDetailsData } = api.search.detailsExtended.useQuery(
    {
      id: parseInt(tvId),
      type: 'tv',
    },
    {
      enabled: !!tvId && !isNaN(parseInt(tvId)),
    }
  )

  // Fetch season details for navigation
  const { data: seasonDetailsData } = api.search.seasonDetails.useQuery(
    {
      tvId: parseInt(tvId),
      seasonNumber: seasonNumber,
    },
    {
      enabled: !!tvId && !isNaN(parseInt(tvId)) && !isNaN(seasonNumber),
    }
  )

  // Fetch episode details
  const {
    data: episodeDetailsData,
    isLoading: episodeLoading,
    error: episodeError,
  } = api.search.episodeDetails.useQuery(
    {
      tvId: parseInt(tvId),
      seasonNumber: seasonNumber,
      episodeNumber: episodeNumber,
    },
    {
      enabled:
        !!tvId &&
        !isNaN(parseInt(tvId)) &&
        !isNaN(seasonNumber) &&
        !isNaN(episodeNumber),
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

  // Set TV show details
  useEffect(() => {
    if (tvDetailsData) {
      const tvData = tvDetailsData as TMDBTVDetailsExtended
      setTvShowDetails(tvData)
    }
  }, [tvDetailsData])

  // Set season details
  useEffect(() => {
    if (seasonDetailsData) {
      setSeasonDetails(seasonDetailsData as TMDBSeasonDetailsItem)
    }
  }, [seasonDetailsData])

  // Set episode details
  useEffect(() => {
    if (episodeDetailsData) {
      setEpisodeDetails(episodeDetailsData as TMDBEpisode)
      setIsLoading(false)
    }
  }, [episodeDetailsData])

  useEffect(() => {
    if (episodeError) {
      setError('Failed to load episode details')
      setIsLoading(false)
    }
  }, [episodeError])

  useEffect(() => {
    setIsLoading(episodeLoading)
  }, [episodeLoading])

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

  // Episode navigation logic
  const getEpisodeNavigation = () => {
    if (!seasonDetails?.episodes) {
      return {
        hasPrevious: false,
        hasNext: false,
        previousEpisode: null,
        nextEpisode: null,
      }
    }

    const episodes = seasonDetails.episodes.sort(
      (a, b) => a.episode_number - b.episode_number
    )
    const currentIndex = episodes.findIndex(
      ep => ep.episode_number === episodeNumber
    )

    const hasPrevious = currentIndex > 0
    const hasNext = currentIndex < episodes.length - 1

    const previousEpisode = hasPrevious ? episodes[currentIndex - 1] : null
    const nextEpisode = hasNext ? episodes[currentIndex + 1] : null

    return { hasPrevious, hasNext, previousEpisode, nextEpisode }
  }

  const { hasPrevious, hasNext, previousEpisode, nextEpisode } =
    getEpisodeNavigation()

  const handleUpdateEpisodeStatus = async (status: EpisodeWatchStatus) => {
    if (!userWatchedItem) return

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

  if (isLoading) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tv/${tvId}/season/${seasonNumber}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Season
              </Link>
            </Button>
          </div>
          <LoadingCard />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !episodeDetails) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tv/${tvId}/season/${seasonNumber}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Season
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Episode not found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {error || 'Unable to load episode details'}
                </p>
                <Button asChild>
                  <Link href={`/tv/${tvId}/season/${seasonNumber}`}>
                    Return to Season
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const stillUrl = episodeDetails.still_path
    ? TMDBService.getImageUrl(episodeDetails.still_path, 'w500')
    : null

  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        {/* Episode Navigation */}
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
                href={`/tv/${tvId}/season/${seasonNumber}/episode/${previousEpisode?.episode_number}`}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Episode {previousEpisode?.episode_number}
              </Link>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Episode
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center col-span-1">
            Episode {episodeNumber} of {seasonDetails?.episodes?.length || '?'}
          </p>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            asChild={hasNext}
            className="col-span-2"
          >
            {hasNext ? (
              <Link
                href={`/tv/${tvId}/season/${seasonNumber}/episode/${nextEpisode?.episode_number}`}
              >
                Episode {nextEpisode?.episode_number}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            ) : (
              <>
                Next Episode
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Episode Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Episode Still */}
          <div className="lg:col-span-1">
            {stillUrl ? (
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={stillUrl}
                  alt={episodeDetails.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Tv2 className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Episode Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">
                    {episodeNumber}. {episodeDetails.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <p className="text-lg text-muted-foreground">
                      {tvShowDetails?.name} • Season {seasonNumber}
                    </p>
                  </div>
                </div>

                {/* Spoiler Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSpoilerMode(!spoilerMode)}
                  className="ml-4"
                >
                  {spoilerMode ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Spoilers
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Spoilers
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                {episodeDetails.air_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatAirDate(episodeDetails.air_date)}
                    </span>
                  </div>
                )}
                {episodeDetails.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatRuntime(episodeDetails.runtime)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {episodeDetails.vote_average.toFixed(1)}/10
                  </span>
                </div>
              </div>

              {/* Episode Overview */}
              {episodeDetails.overview && (
                <div className="mb-6">
                  {spoilerMode ? (
                    <p className="text-muted-foreground leading-relaxed">
                      {episodeDetails.overview}
                    </p>
                  ) : (
                    <div className="relative">
                      <p className="text-muted-foreground leading-relaxed blur-sm select-none">
                        {episodeDetails.overview}
                      </p>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge variant="outline">Spoiler Hidden</Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Progress & Actions */}
            {userWatchedItem && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Episode Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge
                      variant={
                        currentEpisodeWatchStatus === 'WATCHED'
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {currentEpisodeWatchStatus}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        currentEpisodeWatchStatus === 'WATCHED'
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => handleUpdateEpisodeStatus('WATCHED')}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Watched
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        currentEpisodeWatchStatus === 'UNWATCHED'
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => handleUpdateEpisodeStatus('UNWATCHED')}
                      className="flex-1"
                    >
                      <Circle className="h-4 w-4 mr-2" />
                      Mark Unwatched
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/tv/${tvId}/notes`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Episode Note
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions for non-tracked shows */}
            {!userWatchedItem && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddToQueueButton
                    tmdbItem={{
                      id: parseInt(tvId),
                      media_type: 'tv',
                      name: tvShowDetails?.name || 'Unknown Show',
                      poster_path: tvShowDetails?.poster_path,
                      first_air_date: tvShowDetails?.first_air_date,
                      overview: tvShowDetails?.overview,
                      vote_average: tvShowDetails?.vote_average || 0,
                      adult: false,
                      vote_count: 0,
                    }}
                    seasonNumber={seasonNumber}
                    episodeNumber={episodeNumber}
                    size="sm"
                    className="w-full"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Guest Stars */}
        {episodeDetails.guest_stars &&
          episodeDetails.guest_stars.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Guest Stars</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {episodeDetails.guest_stars
                  .slice(0, 8)
                  .map((guest: TMDBCastMember) => (
                    <Card key={guest.id}>
                      <CardContent className="p-4 flex gap-4">
                        {guest.profile_path ? (
                          <div className="relative rounded-lg overflow-hidden w-16 h-auto">
                            <img
                              src={
                                TMDBService.getPosterUrl(
                                  guest.profile_path,
                                  'w185'
                                ) || ''
                              }
                              alt={guest.name}
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
                            {guest.name}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-tight">
                            {guest.character}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

        {/* Episode Crew */}
        {episodeDetails.crew && episodeDetails.crew.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Crew</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodeDetails.crew
                .filter((member: TMDBCrewMember) =>
                  ['Director', 'Writer', 'Executive Producer'].includes(
                    member.job
                  )
                )
                .slice(0, 6)
                .map((crewMember: TMDBCrewMember) => (
                  <Card key={`${crewMember.id}-${crewMember.job}`}>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm">{crewMember.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {crewMember.job}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Back to Season/Show Navigation */}
        <div className="flex flex-wrap gap-4 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href={`/tv/${tvId}/season/${seasonNumber}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Season {seasonNumber}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/tv/${tvId}`}>
              <Tv2 className="h-4 w-4 mr-2" />
              Back to {tvShowDetails?.name || 'TV Show'}
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
