'use client'

import { useState } from 'react'
import {
  Play,
  Check,
  Clock,
  ChevronRight,
  Tv2,
  Edit3,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TMDBService } from '@/lib/tmdb'
import Link from 'next/link'
import type { WatchedItem, TMDBTVDetailsExtended } from '@/types'

interface SeasonOverviewProps {
  watchedItem: WatchedItem
  tvDetails: TMDBTVDetailsExtended
  onUpdateProgress: (data: { currentSeason: number; currentEpisode: number }) => void
  className?: string
}

interface SeasonCardProps {
  season: NonNullable<TMDBTVDetailsExtended['seasons']>[number]
  watchedItem: WatchedItem
  tvId: string
  onUpdateProgress: (data: { currentSeason: number; currentEpisode: number }) => void
}

function SeasonCard({ season, watchedItem, tvId, onUpdateProgress }: SeasonCardProps) {
  if (!season) return null
  const currentSeason = watchedItem.currentSeason || 0
  const currentEpisode = watchedItem.currentEpisode || 0

  // Calculate progress for this season
  const isSeasonCompleted = currentSeason > season.season_number
  const isSeasonCurrent = currentSeason === season.season_number
  const isSeasonUpcoming = currentSeason < season.season_number

  let watchedEpisodes = 0
  if (isSeasonCompleted) {
    watchedEpisodes = season.episode_count
  } else if (isSeasonCurrent) {
    watchedEpisodes = currentEpisode
  }

  const seasonProgress = season.episode_count > 0 
    ? (watchedEpisodes / season.episode_count) * 100 
    : 0

  const posterUrl = season.poster_path
    ? TMDBService.getPosterUrl(season.poster_path, 'w342')
    : null

  const formatAirDate = (dateString: string | null): string => {
    if (!dateString) return 'TBA'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  const getSeasonStatus = () => {
    if (isSeasonCompleted) return { label: 'Completed', variant: 'default' as const }
    if (isSeasonCurrent) return { label: 'Watching', variant: 'secondary' as const }
    if (isSeasonUpcoming) return { label: 'Not Started', variant: 'outline' as const }
    return { label: 'Unknown', variant: 'outline' as const }
  }

  const status = getSeasonStatus()

  const handleQuickStart = () => {
    onUpdateProgress({
      currentSeason: season.season_number,
      currentEpisode: 1,
    })
  }

  const handleMarkCompleted = () => {
    // Check if this is the last season to determine if the entire show should be marked complete
    const isLastSeason = season.season_number === (watchedItem.totalSeasons || season.season_number)
    
    onUpdateProgress({
      currentSeason: season.season_number,
      currentEpisode: season.episode_count,
      // If this is the last season, mark the entire show as completed
      ...(isLastSeason && { 
        status: 'COMPLETED' as const,
        finishDate: new Date()
      })
    })
  }

  return (
    <Card className={`group transition-all hover:shadow-md ${isSeasonCurrent ? 'ring-2 ring-primary' : ''}`}>
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
              {isSeasonCompleted && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}
              {isSeasonCurrent && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
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
                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {watchedEpisodes}/{season.episode_count} episodes
                </span>
              </div>
              <Progress value={seasonProgress} className="h-1.5" />
            </div>

            {/* Overview */}
            {season.overview && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {season.overview}
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {isSeasonUpcoming && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleQuickStart}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start Season
                </Button>
              )}
              {isSeasonCurrent && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkCompleted}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark Complete
                </Button>
              )}
              {(isSeasonCurrent || isSeasonCompleted) && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(seasonProgress)}% complete
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SeasonOverview({
  watchedItem,
  tvDetails,
  onUpdateProgress,
  className,
}: SeasonOverviewProps) {
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false)
  const [quickSeason, setQuickSeason] = useState(watchedItem.currentSeason || 1)
  const [quickEpisode, setQuickEpisode] = useState(watchedItem.currentEpisode || 1)

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

  const totalEpisodes = mainSeasons.reduce((total, season) => total + season.episode_count, 0)
  const watchedEpisodes = mainSeasons.reduce((total, season) => {
    const currentSeason = watchedItem.currentSeason || 0
    const currentEpisode = watchedItem.currentEpisode || 0
    
    if (currentSeason > season.season_number) {
      return total + season.episode_count
    } else if (currentSeason === season.season_number) {
      return total + currentEpisode
    }
    return total
  }, 0)

  const overallProgress = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0

  const handleQuickEdit = () => {
    onUpdateProgress({
      currentSeason: quickSeason,
      currentEpisode: quickEpisode,
    })
    setIsQuickEditOpen(false)
  }

  const currentSeasonData = mainSeasons.find(s => s.season_number === watchedItem.currentSeason)
  const nextEpisode = currentSeasonData 
    ? `S${watchedItem.currentSeason}E${(watchedItem.currentEpisode || 0) + 1}`
    : 'S1E1'

  return (
    <div className={className}>
      {/* Overall Progress Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Season Progress</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track your progress through all {mainSeasons.length} seasons
              </p>
            </div>
            <Dialog open={isQuickEditOpen} onOpenChange={setIsQuickEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Quick Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Progress</DialogTitle>
                  <DialogDescription>
                    Set your current season and episode progress for {watchedItem.title}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="season">Season</Label>
                    <Input
                      id="season"
                      type="number"
                      min="1"
                      max={watchedItem.totalSeasons || undefined}
                      value={quickSeason}
                      onChange={(e) => setQuickSeason(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="episode">Episode</Label>
                    <Input
                      id="episode"
                      type="number"
                      min="1"
                      value={quickEpisode}
                      onChange={(e) => setQuickEpisode(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsQuickEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleQuickEdit}>
                    Update Progress
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">
                  {watchedEpisodes}/{totalEpisodes} episodes ({Math.round(overallProgress)}%)
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {/* Current Progress Info */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{watchedItem.currentSeason || 0}</div>
                <div className="text-xs text-muted-foreground">Current Season</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{watchedItem.currentEpisode || 0}</div>
                <div className="text-xs text-muted-foreground">Current Episode</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{nextEpisode}</div>
                <div className="text-xs text-muted-foreground">Up Next</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Seasons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Seasons</h3>
        <div className="space-y-3">
          {mainSeasons.map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              watchedItem={watchedItem}
              tvId={tvDetails.id.toString()}
              onUpdateProgress={onUpdateProgress}
            />
          ))}
        </div>
      </div>

      {/* Special Seasons */}
      {specialSeasons.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Specials</h3>
          <div className="space-y-3">
            {specialSeasons.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                watchedItem={watchedItem}
                tvId={tvDetails.id.toString()}
                onUpdateProgress={onUpdateProgress}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}