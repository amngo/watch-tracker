'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { EpisodeItem } from './episode/episode-item'
import { SeasonProgressHeader } from './episode/season-progress-header'
import { NextEpisodeBanner } from './episode/next-episode-banner'
import type { WatchedItem, TMDBSeasonDetailsItem } from '@/types'

interface EpisodeTrackerProps {
  watchedItem: WatchedItem
  seasonDetails: TMDBSeasonDetailsItem
  onUpdateProgress: (data: { currentSeason: number; currentEpisode: number }) => void
  className?: string
}

export function EpisodeTracker({
  watchedItem,
  seasonDetails,
  onUpdateProgress,
  className,
}: EpisodeTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(true)

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

  const nextEpisodeToWatch = seasonDetails.episodes.find(ep => 
    !isEpisodeWatched(ep.episode_number)
  )

  return (
    <div className={className}>
      <Card>
        <SeasonProgressHeader
          seasonDetails={seasonDetails}
          watchedItem={watchedItem}
          isExpanded={isExpanded}
          watchedEpisodesInSeason={watchedEpisodesInSeason}
          seasonProgress={seasonProgress}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          onUpdateProgress={onUpdateProgress}
        />

        {isExpanded && (
          <CardContent className="pt-0">
            {nextEpisodeToWatch && (
              <NextEpisodeBanner
                nextEpisode={nextEpisodeToWatch}
                onStartWatching={handleMarkAsCurrentEpisode}
              />
            )}

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