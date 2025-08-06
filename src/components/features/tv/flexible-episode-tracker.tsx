'use client'
import { useState, useMemo, useEffect } from 'react'
import { Edit3, Eye, EyeOff, Check, SkipForward, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Toggle } from '@/components/ui/toggle'

import { useEpisodeSpoilerState } from '@/hooks/use-episode-spoiler-state'
import { useEpisodeActions } from '@/hooks/use-episode-actions'
import { formatPercentage } from '@/lib/format'
import { EpisodeCardList } from './episode'

import type { WatchedItem, EpisodeWatchStatus } from '@/types'
import { SeasonDetails } from 'tmdb-ts'

interface FlexibleEpisodeTrackerProps {
  watchedItem: WatchedItem
  seasonDetails: SeasonDetails
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

export function FlexibleEpisodeTracker({
  watchedItem,
  seasonDetails,
  onUpdateEpisodeStatus,
  onBulkUpdateEpisodes,
  className,
}: FlexibleEpisodeTrackerProps) {
  const [showSpoilers, setShowSpoilers] = useState(false)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<number>>(
    new Set()
  )

  const seasonNumber = seasonDetails.season_number

  // Keyboard shortcut for spoiler toggle
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        setShowSpoilers(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Custom hooks for state management
  const { getEpisodeSpoilerVisible, toggleEpisodeSpoiler } =
    useEpisodeSpoilerState(watchedItem.id)

  const {
    getEpisodeStatus,
    handleEpisodeStatusChange,
    handleBulkAction: handleBulkActionHook,
    calculateSeasonProgress,
  } = useEpisodeActions(
    watchedItem,
    onUpdateEpisodeStatus,
    onBulkUpdateEpisodes
  )

  // Calculate season progress based on watched episodes
  const { watchedCount, skippedCount, totalCount, remainingCount, progress } =
    useMemo(
      () => calculateSeasonProgress(seasonDetails.episodes, seasonNumber),
      [calculateSeasonProgress, seasonDetails.episodes, seasonNumber]
    )

  const handleBulkAction = (action: EpisodeWatchStatus) => {
    handleBulkActionHook(selectedEpisodes, seasonNumber, action)
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{seasonDetails.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {formatPercentage(progress)}
              </span>

              {/* View Controls */}
              <div className="flex items-center gap-1">
                <Toggle
                  pressed={showSpoilers}
                  onPressedChange={setShowSpoilers}
                  size="sm"
                  title={`${showSpoilers ? 'Hide all spoilers' : 'Show all spoilers'} (Ctrl+S)`}
                  aria-label={
                    showSpoilers ? 'Hide all spoilers' : 'Show all spoilers'
                  }
                >
                  {showSpoilers ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Toggle>

                <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Edit3 className="h-4 w-4 mr-1" />
                      Bulk Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
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
                            Watched
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleBulkAction('SKIPPED')}
                          >
                            <SkipForward className="h-4 w-4 mr-1" />
                            Skipped
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleBulkAction('UNWATCHED')}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Unwatched
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

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
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  {skippedCount}
                </div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{remainingCount}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>

          {/* Episodes Grid/List */}
          <div className={`gap-4 space-y-3`}>
            {seasonDetails.episodes.map(episode => {
              const episodeStatus = getEpisodeStatus(
                seasonNumber,
                episode.episode_number
              )
              const individualSpoilerVisible = getEpisodeSpoilerVisible(
                seasonNumber,
                episode.episode_number
              )

              return (
                <EpisodeCardList
                  key={episode.id}
                  episode={episode}
                  status={episodeStatus}
                  showSpoilers={showSpoilers}
                  individualSpoilerVisible={individualSpoilerVisible}
                  onStatusChange={status =>
                    handleEpisodeStatusChange(
                      seasonNumber,
                      episode.episode_number,
                      status
                    )
                  }
                  onToggleIndividualSpoiler={() =>
                    toggleEpisodeSpoiler(seasonNumber, episode.episode_number)
                  }
                  watchedItem={watchedItem}
                  showQueueButton={true}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
