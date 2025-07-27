'use client'

import { useState } from 'react'
import {
  Play,
  Check,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  Edit3,
  Calendar,
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
import type { WatchedItem, TMDBSeasonDetailsItem, TMDBEpisodeItem } from '@/types'

interface EpisodeTrackerProps {
  watchedItem: WatchedItem
  seasonDetails: TMDBSeasonDetailsItem
  onUpdateProgress: (data: { currentSeason: number; currentEpisode: number }) => void
  className?: string
}

interface EpisodeItemProps {
  episode: TMDBEpisodeItem
  isWatched: boolean
  isCurrent: boolean
  onMarkWatched: (episodeNumber: number) => void
  onMarkAsCurrentEpisode: (episodeNumber: number) => void
}

function EpisodeItem({
  episode,
  isWatched,
  isCurrent,
  onMarkWatched,
  onMarkAsCurrentEpisode,
}: EpisodeItemProps) {
  const stillUrl = episode.still_path
    ? TMDBService.getImageUrl(episode.still_path, 'w500')
    : null

  const formatAirDate = (dateString: string | null): string => {
    if (!dateString) return 'TBA'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatRuntime = (minutes: number | null): string => {
    if (!minutes) return 'Unknown'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Card className={`transition-all ${isCurrent ? 'ring-2 ring-primary' : ''} ${isWatched ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Episode Still */}
          <div className="relative flex-shrink-0 w-24 h-16 rounded overflow-hidden">
            {stillUrl ? (
              <img
                src={stillUrl}
                alt={episode.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="bg-muted flex items-center justify-center w-full h-full">
                <Play className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {isWatched && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
            )}
            {isCurrent && !isWatched && (
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
            )}
          </div>

          {/* Episode Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm leading-tight mb-1">
                  {episode.episode_number}. {episode.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  {episode.air_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatAirDate(episode.air_date)}</span>
                    </div>
                  )}
                  {episode.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatRuntime(episode.runtime)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{episode.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                {episode.overview && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {episode.overview}
                  </p>
                )}
              </div>

              {/* Episode Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isWatched && (
                  <Button
                    size="sm"
                    variant={isCurrent ? "default" : "outline"}
                    onClick={() => onMarkAsCurrentEpisode(episode.episode_number)}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    {isCurrent ? 'Current' : 'Set Current'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isWatched ? "secondary" : "default"}
                  onClick={() => onMarkWatched(episode.episode_number)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {isWatched ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Watched
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Mark Watched
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EpisodeTracker({
  watchedItem,
  seasonDetails,
  onUpdateProgress,
  className,
}: EpisodeTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false)
  const [quickSeason, setQuickSeason] = useState(watchedItem.currentSeason || 1)
  const [quickEpisode, setQuickEpisode] = useState(watchedItem.currentEpisode || 1)

  const currentSeason = watchedItem.currentSeason || 0
  const currentEpisode = watchedItem.currentEpisode || 0
  const seasonNumber = seasonDetails.season_number

  // Calculate progress for this season
  const isSeasonCompleted = currentSeason > seasonNumber
  const watchedEpisodesInSeason = isSeasonCompleted 
    ? seasonDetails.episodes.length 
    : (currentSeason === seasonNumber ? currentEpisode : 0)
  
  const seasonProgress = (watchedEpisodesInSeason / seasonDetails.episodes.length) * 100

  const isEpisodeWatched = (episodeNumber: number): boolean => {
    if (currentSeason > seasonNumber) return true
    if (currentSeason === seasonNumber) return episodeNumber <= currentEpisode
    return false
  }

  const isCurrentEpisode = (episodeNumber: number): boolean => {
    return currentSeason === seasonNumber && currentEpisode === episodeNumber
  }

  const handleMarkWatched = (episodeNumber: number) => {
    // Mark episode as watched by setting current episode to this episode number
    onUpdateProgress({
      currentSeason: seasonNumber,
      currentEpisode: episodeNumber,
    })
  }

  const handleMarkAsCurrentEpisode = (episodeNumber: number) => {
    onUpdateProgress({
      currentSeason: seasonNumber,
      currentEpisode: episodeNumber,
    })
  }

  const handleQuickEdit = () => {
    onUpdateProgress({
      currentSeason: quickSeason,
      currentEpisode: quickEpisode,
    })
    setIsQuickEditOpen(false)
  }

  const nextEpisodeToWatch = seasonDetails.episodes.find(ep => 
    !isEpisodeWatched(ep.episode_number)
  )

  return (
    <div className={className}>
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <CardTitle className="text-lg">
                {seasonDetails.name}
              </CardTitle>
              <Badge variant="outline">
                {watchedEpisodesInSeason}/{seasonDetails.episodes.length} episodes
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{Math.round(seasonProgress)}%</span>
              <Dialog open={isQuickEditOpen} onOpenChange={setIsQuickEditOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsQuickEditOpen(true)
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Quick Edit
                  </Button>
                </DialogTrigger>
                <DialogContent onClick={(e) => e.stopPropagation()}>
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
          </div>
          <Progress value={seasonProgress} className="h-2" />
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            {/* Next Episode to Watch */}
            {nextEpisodeToWatch && (
              <div className="mb-4 p-3 bg-primary/5 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Up Next</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Episode {nextEpisodeToWatch.episode_number}: {nextEpisodeToWatch.name}
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => handleMarkAsCurrentEpisode(nextEpisodeToWatch.episode_number)}
                >
                  Start Watching
                </Button>
              </div>
            )}

            {/* Episodes List */}
            <div className="space-y-2">
              {seasonDetails.episodes.map((episode) => (
                <EpisodeItem
                  key={episode.id}
                  episode={episode}
                  isWatched={isEpisodeWatched(episode.episode_number)}
                  isCurrent={isCurrentEpisode(episode.episode_number)}
                  onMarkWatched={handleMarkWatched}
                  onMarkAsCurrentEpisode={handleMarkAsCurrentEpisode}
                />
              ))}
            </div>

            {/* Season Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Season Progress</span>
                <span className="font-medium">
                  {watchedEpisodesInSeason} of {seasonDetails.episodes.length} episodes watched
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}