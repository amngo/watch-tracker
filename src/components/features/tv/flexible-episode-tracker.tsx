'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Play,
  Check,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  Edit3,
  Calendar,
  Eye,
  EyeOff,
  SkipForward,
  Grid3X3,
  List,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Toggle } from '@/components/ui/toggle'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TMDBService } from '@/lib/tmdb'
import type {
  WatchedItem,
  TMDBSeasonDetailsItem,
  TMDBEpisodeItem,
  EpisodeWatchStatus,
  WatchedEpisode,
} from '@/types'
import { cn } from '@/lib/utils'

interface FlexibleEpisodeTrackerProps {
  watchedItem: WatchedItem
  seasonDetails: TMDBSeasonDetailsItem
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

interface EpisodeCardProps {
  episode: TMDBEpisodeItem
  status: EpisodeWatchStatus
  seasonNumber: number
  onStatusChange: (status: EpisodeWatchStatus) => void
  viewMode: 'grid' | 'list'
  showSpoilers: boolean
  individualSpoilerVisible: boolean
  onToggleIndividualSpoiler: () => void
}

const statusConfig = {
  UNWATCHED: {
    label: 'Not Watched',
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    borderColor: 'border-muted',
    opacity: 'opacity-100',
  },
  WATCHED: {
    label: 'Watched',
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-muted/20',
    borderColor: 'border-green-300',
    opacity: 'opacity-30',
  },
  SKIPPED: {
    label: 'Skipped',
    icon: SkipForward,
    color: 'text-orange-600',
    bgColor: 'bg-muted/20',
    borderColor: 'border-orange-300',
    opacity: 'opacity-30',
  },
}

function EpisodeCard({
  episode,
  status,
  seasonNumber,
  onStatusChange,
  viewMode,
  showSpoilers,
  individualSpoilerVisible,
  onToggleIndividualSpoiler,
}: EpisodeCardProps) {
  const config = statusConfig[status]
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

  if (viewMode === 'grid') {
    return (
      <Card
        className={`transition-all hover:shadow-md ${config.bgColor} ${config.borderColor} border-2 ${config.opacity}`}
      >
        <CardContent className="p-3">
          {/* Episode Still */}
          <div className="relative mb-3">
            {stillUrl ? (
              <div className="aspect-video rounded overflow-hidden">
                <img
                  src={stillUrl}
                  alt={episode.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded flex items-center justify-center">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Status Overlay */}
            <div className="absolute top-2 right-2">
              <Badge
                variant={
                  status === 'WATCHED'
                    ? 'default'
                    : status === 'SKIPPED'
                      ? 'secondary'
                      : 'outline'
                }
              >
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Episode Info */}
          <div className={cn('space-y-2', config.opacity)}>
            <h4 className="font-medium text-sm leading-tight">
              {episode.episode_number}. {episode.name}
            </h4>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

            {/* Episode Overview */}
            {episode.overview && (
              <div className="text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    {showSpoilers || status === 'WATCHED' || individualSpoilerVisible ? (
                      <p className="line-clamp-3">{episode.overview}</p>
                    ) : (
                      <p className="blur-sm line-clamp-3 select-none">
                        {episode.overview}
                      </p>
                    )}
                  </div>
                  {status !== 'WATCHED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onToggleIndividualSpoiler}
                      className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      {individualSpoilerVisible ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Status Actions */}
            <div className="flex gap-1 pt-2">
              <Button
                size="sm"
                variant={status === 'WATCHED' ? 'default' : 'outline'}
                onClick={() =>
                  onStatusChange(status === 'WATCHED' ? 'UNWATCHED' : 'WATCHED')
                }
                className="flex-1 text-xs h-7"
              >
                <Check className="h-3 w-3 mr-1" />
                {status === 'WATCHED' ? 'Watched' : 'Mark Watched'}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="px-2 h-7">
                    ⋯
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStatusChange('WATCHED')}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Watched
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('SKIPPED')}>
                    <SkipForward className="h-4 w-4 mr-2" />
                    Mark as Skipped
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('UNWATCHED')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as Unwatched
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // List view
  return (
    <Card
      className={`transition-all hover:shadow-sm ${config.bgColor} ${config.borderColor} border-l-4`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Episode Still */}
          <div
            className={cn(
              'relative flex-shrink-0 w-24 h-16 rounded overflow-hidden',
              config.opacity
            )}
          >
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
          </div>

          {/* Episode Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className={cn('min-w-0 flex-1', config.opacity)}>
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
                  <div className="flex items-start gap-2">
                    <p
                      className={`text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1 ${!showSpoilers && status !== 'WATCHED' && !individualSpoilerVisible ? 'blur-sm select-none' : ''}`}
                    >
                      {episode.overview}
                    </p>
                    {status !== 'WATCHED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onToggleIndividualSpoiler}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
                      >
                        {individualSpoilerVisible ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  variant={
                    status === 'WATCHED'
                      ? 'default'
                      : status === 'SKIPPED'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="text-xs"
                >
                  <config.icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2 py-1 h-auto"
                    >
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onStatusChange('WATCHED')}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Watched
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange('SKIPPED')}>
                      <SkipForward className="h-4 w-4 mr-2" />
                      Mark as Skipped
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange('UNWATCHED')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Mark as Unwatched
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FlexibleEpisodeTracker({
  watchedItem,
  seasonDetails,
  onUpdateEpisodeStatus,
  onBulkUpdateEpisodes,
  className,
}: FlexibleEpisodeTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showSpoilers, setShowSpoilers] = useState(false)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<number>>(
    new Set()
  )
  const [individualSpoilerStates, setIndividualSpoilerStates] = useState<
    Map<string, boolean>
  >(new Map())

  const seasonNumber = seasonDetails.season_number

  // Load individual spoiler states from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('episodeSpoilerStates')
      if (stored) {
        const parsedStates = JSON.parse(stored)
        setIndividualSpoilerStates(new Map(Object.entries(parsedStates)))
      }
    } catch (error) {
      console.warn('Failed to load episode spoiler states:', error)
    }
  }, [])

  // Save individual spoiler states to localStorage when they change
  useEffect(() => {
    try {
      const statesObject = Object.fromEntries(individualSpoilerStates)
      localStorage.setItem('episodeSpoilerStates', JSON.stringify(statesObject))
    } catch (error) {
      console.warn('Failed to save episode spoiler states:', error)
    }
  }, [individualSpoilerStates])

  // Helper functions for individual spoiler management
  const getEpisodeKey = (seasonNum: number, episodeNum: number) => 
    `${watchedItem.id}-s${seasonNum}-e${episodeNum}`

  const getIndividualSpoilerVisible = (episodeNumber: number): boolean => {
    const key = getEpisodeKey(seasonNumber, episodeNumber)
    return individualSpoilerStates.get(key) || false
  }

  const toggleIndividualSpoiler = (episodeNumber: number) => {
    const key = getEpisodeKey(seasonNumber, episodeNumber)
    setIndividualSpoilerStates(prev => {
      const newMap = new Map(prev)
      newMap.set(key, !prev.get(key))
      return newMap
    })
  }

  // Get episode status from watchedEpisodes array
  const getEpisodeStatus = (episodeNumber: number): EpisodeWatchStatus => {
    const episode = watchedItem.watchedEpisodes?.find(
      ep =>
        ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
    )
    return episode?.status || 'UNWATCHED'
  }

  // Calculate season progress based on watched episodes
  const { watchedCount, skippedCount, totalCount, seasonProgress } =
    useMemo(() => {
      const watched = seasonDetails.episodes.filter(
        ep => getEpisodeStatus(ep.episode_number) === 'WATCHED'
      ).length
      const skipped = seasonDetails.episodes.filter(
        ep => getEpisodeStatus(ep.episode_number) === 'SKIPPED'
      ).length
      const total = seasonDetails.episodes.length
      const progress = total > 0 ? ((watched + skipped) / total) * 100 : 0

      return {
        watchedCount: watched,
        skippedCount: skipped,
        totalCount: total,
        seasonProgress: progress,
      }
    }, [seasonDetails.episodes, watchedItem.watchedEpisodes, seasonNumber])

  const handleEpisodeStatusChange = (
    episodeNumber: number,
    status: EpisodeWatchStatus
  ) => {
    onUpdateEpisodeStatus(seasonNumber, episodeNumber, status)
  }

  const handleBulkAction = (action: EpisodeWatchStatus) => {
    const episodes = Array.from(selectedEpisodes).map(episodeNumber => ({
      seasonNumber,
      episodeNumber,
      status: action,
    }))
    onBulkUpdateEpisodes(episodes)
    setSelectedEpisodes(new Set())
    setIsBulkEditOpen(false)
  }

  const toggleEpisodeSelection = (episodeNumber: number) => {
    const newSelection = new Set(selectedEpisodes)
    if (newSelection.has(episodeNumber)) {
      newSelection.delete(episodeNumber)
    } else {
      newSelection.add(episodeNumber)
    }
    setSelectedEpisodes(newSelection)
  }

  const selectAllEpisodes = () => {
    setSelectedEpisodes(
      new Set(seasonDetails.episodes.map(ep => ep.episode_number))
    )
  }

  const clearSelection = () => {
    setSelectedEpisodes(new Set())
  }

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
              <CardTitle className="text-lg">{seasonDetails.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{watchedCount} watched</Badge>
                {skippedCount > 0 && (
                  <Badge variant="secondary">{skippedCount} skipped</Badge>
                )}
                <Badge variant="outline">{totalCount} total</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {Math.round(seasonProgress)}%
              </span>

              {/* View Controls */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Toggle
                  pressed={showSpoilers}
                  onPressedChange={setShowSpoilers}
                  size="sm"
                  onClick={e => e.stopPropagation()}
                >
                  {showSpoilers ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Toggle>

                <Toggle
                  pressed={viewMode === 'grid'}
                  onPressedChange={pressed =>
                    setViewMode(pressed ? 'grid' : 'list')
                  }
                  size="sm"
                  onClick={e => e.stopPropagation()}
                >
                  {viewMode === 'grid' ? (
                    <Grid3X3 className="h-4 w-4" />
                  ) : (
                    <List className="h-4 w-4" />
                  )}
                </Toggle>

                <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation()
                        setIsBulkEditOpen(true)
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Bulk Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent onClick={e => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>Bulk Episode Actions</DialogTitle>
                      <DialogDescription>
                        Select episodes and apply actions to multiple episodes
                        at once
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Selection Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={selectAllEpisodes}
                        >
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={clearSelection}
                        >
                          Clear Selection
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {selectedEpisodes.size} episodes selected
                        </span>
                      </div>

                      {/* Episode Selection */}
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {seasonDetails.episodes.map(episode => (
                          <div
                            key={episode.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                              selectedEpisodes.has(episode.episode_number)
                                ? 'bg-primary/10'
                                : ''
                            }`}
                            onClick={() =>
                              toggleEpisodeSelection(episode.episode_number)
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedEpisodes.has(
                                episode.episode_number
                              )}
                              onChange={() =>
                                toggleEpisodeSelection(episode.episode_number)
                              }
                              className="rounded"
                            />
                            <span className="text-sm">
                              {episode.episode_number}. {episode.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bulk Actions */}
                      {selectedEpisodes.size > 0 && (
                        <div className="flex gap-2">
                          <Button onClick={() => handleBulkAction('WATCHED')}>
                            <Check className="h-4 w-4 mr-1" />
                            Mark as Watched
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleBulkAction('SKIPPED')}
                          >
                            <SkipForward className="h-4 w-4 mr-1" />
                            Mark as Skipped
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleBulkAction('UNWATCHED')}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Mark as Unwatched
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <Progress value={seasonProgress} className="h-2" />
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            {/* Progress Summary */}
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {watchedCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Watched</div>
                </div>
                {skippedCount > 0 && (
                  <div>
                    <div className="text-lg font-semibold text-orange-600">
                      {skippedCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Skipped</div>
                  </div>
                )}
                <div>
                  <div className="text-lg font-semibold">
                    {totalCount - watchedCount - skippedCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
              </div>
            </div>

            {/* Episodes Grid/List */}
            <div
              className={`gap-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}`}
            >
              {seasonDetails.episodes.map(episode => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  status={getEpisodeStatus(episode.episode_number)}
                  seasonNumber={seasonNumber}
                  onStatusChange={status =>
                    handleEpisodeStatusChange(episode.episode_number, status)
                  }
                  viewMode={viewMode}
                  showSpoilers={showSpoilers}
                  individualSpoilerVisible={getIndividualSpoilerVisible(episode.episode_number)}
                  onToggleIndividualSpoiler={() => toggleIndividualSpoiler(episode.episode_number)}
                />
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
