'use client'
import { useState } from 'react'
import { Check, Clock, ChevronRight, Tv2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  calculateSeasonProgress,
  getShowStatistics,
  getNextUnwatchedEpisode,
} from '@/lib/episode-utils'
import Link from 'next/link'
import type { WatchedItem, EpisodeWatchStatus } from '@/types'
import { cn } from '@/lib/utils'
import {
  AppendToResponse,
  getFullImagePath,
  Season,
  TvShowDetails,
} from 'tmdb-ts'

interface FlexibleSeasonOverviewProps {
  watchedItem: WatchedItem
  tvDetails: AppendToResponse<TvShowDetails, 'credits'[], 'tvShow'>
  onUpdateEpisodeStatus: (
    seasonNumber: number,
    episodeNumber: number,
    status: EpisodeWatchStatus
  ) => void
  onBulkUpdateEpisodes: (
    episodes: {
      seasonNumber: number
      episodeNumber: number
      status: EpisodeWatchStatus
    }[]
  ) => void
  className?: string
}

interface SeasonCardProps {
  season: Season
  watchedItem: WatchedItem
  tvId: string
  onBulkUpdateEpisodes: (
    episodes: {
      seasonNumber: number
      episodeNumber: number
      status: EpisodeWatchStatus
    }[]
  ) => void
}

function SeasonCard({
  season,
  watchedItem,
  tvId,
  onBulkUpdateEpisodes,
}: SeasonCardProps) {
  if (!season) return null

  const posterUrl = getFullImagePath(
    'https://image.tmdb.org/t/p/',
    'w342',
    season.poster_path || ''
  )

  const formatAirDate = (dateString: string | null): string => {
    if (!dateString) return 'TBA'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  const { watchedCount, skippedCount, unwatchedCount, progressPercentage } =
    calculateSeasonProgress(
      watchedItem,
      season.season_number,
      season.episode_count
    )

  const getSeasonStatus = () => {
    if (unwatchedCount === 0)
      return {
        label: 'Completed',
        variant: 'default' as const,
        color: 'text-green-600',
      }
    if (watchedCount > 0 || skippedCount > 0)
      return {
        label: 'In Progress',
        variant: 'secondary' as const,
        color: 'text-blue-600',
      }
    return {
      label: 'Not Started',
      variant: 'outline' as const,
      color: 'text-muted-foreground',
    }
  }

  const status = getSeasonStatus()

  const handleMarkAllWatched = () => {
    const episodes = Array.from({ length: season.episode_count }, (_, i) => ({
      seasonNumber: season.season_number,
      episodeNumber: i + 1,
      status: 'WATCHED' as EpisodeWatchStatus,
    }))

    // Use bulk update instead of individual calls
    onBulkUpdateEpisodes(episodes)
  }

  const handleMarkAllUnwatched = () => {
    const episodes = Array.from({ length: season.episode_count }, (_, i) => ({
      seasonNumber: season.season_number,
      episodeNumber: i + 1,
      status: 'UNWATCHED' as EpisodeWatchStatus,
    }))

    // Use bulk update instead of individual calls
    onBulkUpdateEpisodes(episodes)
  }

  return (
    <Card
      className={cn(
        'group transition-all hover:shadow-md p-0',
        unwatchedCount === 0 && 'ring-1 ring-green-200'
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Season Poster */}
          <Link
            href={`/tv/${tvId}/season/${season.season_number}`}
            className="flex-shrink-0"
          >
            <div className="w-20 h-28 relative rounded overflow-hidden">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={season.name}
                  className="object-cover w-full h-full hover:scale-105 transition-transform"
                />
              ) : (
                <div className="bg-muted flex items-center justify-center w-full h-full">
                  <Tv2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {unwatchedCount === 0 && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              )}
            </div>
          </Link>

          {/* Season Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <Link href={`/tv/${tvId}/season/${season.season_number}`}>
                  <h3 className="font-medium text-sm leading-tight mb-1 hover:text-primary transition-colors">
                    {season.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {season.episode_count} episodes
                  </span>
                  {season.air_date && (
                    <span className="text-xs text-muted-foreground">
                      {formatAirDate(season.air_date)}
                    </span>
                  )}
                </div>
              </div>

              <Link href={`/tv/${tvId}/season/${season.season_number}`}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Detailed Progress */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {watchedCount + skippedCount}/{season.episode_count} episodes
                </span>
              </div>
              <Progress value={progressPercentage} className="h-1.5" />

              {/* Episode Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {watchedCount}
                  </div>
                  <div className="text-muted-foreground">Watched</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-orange-600">
                    {skippedCount}
                  </div>
                  <div className="text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{unwatchedCount}</div>
                  <div className="text-muted-foreground">Remaining</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {unwatchedCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllWatched}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark All Watched
                </Button>
              )}

              {watchedCount > 0 || skippedCount > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllUnwatched}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Reset Season
                </Button>
              ) : null}

              <span className="text-xs text-muted-foreground ml-auto">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FlexibleSeasonOverview({
  watchedItem,
  tvDetails,
  onBulkUpdateEpisodes,
  className,
}: FlexibleSeasonOverviewProps) {
  const [isStatsOpen, setIsStatsOpen] = useState(false)

  // Filter out special seasons (season 0) and sort by season number
  const mainSeasons = tvDetails.seasons
    ? tvDetails.seasons
        .filter(season => season.season_number > 0)
        .sort((a, b) => a.season_number - b.season_number)
    : []

  const specialSeasons = tvDetails.seasons
    ? tvDetails.seasons
        .filter(season => season.season_number === 0)
        .sort((a, b) => a.season_number - b.season_number)
    : []

  // Calculate overall statistics
  const allSeasons = mainSeasons.map(s => ({
    season_number: s.season_number,
    episode_count: s.episode_count,
  }))

  const showStats = getShowStatistics(watchedItem, allSeasons)
  const nextEpisode = getNextUnwatchedEpisode(watchedItem, allSeasons)

  return (
    <div className={className}>
      {/* Overall Progress Header */}
      <Card className="mb-6">
        <CardContent>
          <div className="space-y-4">
            {/* Overall Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">
                  {showStats.watchedEpisodes + showStats.skippedEpisodes}/
                  {showStats.totalEpisodes} episodes (
                  {Math.round(showStats.overallProgress)}%)
                </span>
              </div>
              <Progress value={showStats.overallProgress} className="h-2" />
            </div>

            {/* Current Progress Info */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {showStats.watchedEpisodes}
                </div>
                <div className="text-xs text-muted-foreground">Watched</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  {showStats.skippedEpisodes}
                </div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {showStats.unwatchedEpisodes}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {nextEpisode
                    ? `S${nextEpisode.seasonNumber}E${nextEpisode.episodeNumber}`
                    : 'None'}
                </div>
                <div className="text-xs text-muted-foreground">Next Up</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Seasons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Seasons</h3>
        <div className="space-y-3">
          {mainSeasons.map(season => (
            <SeasonCard
              key={season.id}
              season={season}
              watchedItem={watchedItem}
              tvId={tvDetails.id.toString()}
              onBulkUpdateEpisodes={onBulkUpdateEpisodes}
            />
          ))}
        </div>
      </div>

      {/* Special Seasons */}
      {specialSeasons.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Specials</h3>
          <div className="space-y-3">
            {specialSeasons.map(season => (
              <SeasonCard
                key={season.id}
                season={season}
                watchedItem={watchedItem}
                tvId={tvDetails.id.toString()}
                onBulkUpdateEpisodes={onBulkUpdateEpisodes}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
