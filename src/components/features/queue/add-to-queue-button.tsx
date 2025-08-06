'use client'

import { useState } from 'react'
import { ListPlus, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useQueue } from '@/hooks/use-queue'
import type { WatchedItem } from '@/types'
import { MovieWithMediaType, TVWithMediaType } from 'tmdb-ts'

interface AddToQueueButtonProps {
  // Can accept either a WatchedItem or TMDB data
  item?: WatchedItem
  tmdbItem?: TVWithMediaType | MovieWithMediaType

  // For TV shows, allow specific episode selection
  seasonNumber?: number
  episodeNumber?: number

  // Styling
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string

  // Behavior
  showDropdown?: boolean // For TV shows with episode selection
  disabled?: boolean
}

export function AddToQueueButton({
  item,
  tmdbItem,
  seasonNumber,
  episodeNumber,
  variant = 'outline',
  size = 'sm',
  className,
  showDropdown = false,
  disabled = false,
}: AddToQueueButtonProps) {
  const {
    addToQueue,
    addNextEpisode,
    isInQueue,
    getQueuePosition,
    isAddingToQueue,
    isAddingNextEpisode,
  } = useQueue()

  const [isOpen, setIsOpen] = useState(false)

  // Determine the content data to use
  const contentData =
    item || (tmdbItem ? convertTMDBToWatchedItem(tmdbItem) : null)

  if (!contentData) return null

  const isTV = contentData.mediaType === 'TV'
  const contentId = item?.id || `tmdb-${contentData.tmdbId}`

  // Check if this specific item/episode is in queue
  const inQueue = isInQueue(contentId, seasonNumber, episodeNumber)
  const queuePosition = getQueuePosition(contentId, seasonNumber, episodeNumber)

  const isLoading = isAddingToQueue || isAddingNextEpisode

  const handleAddToQueue = () => {
    if (inQueue || !contentData) return

    const queueData = {
      contentId,
      contentType: contentData.mediaType,
      title: contentData.title,
      poster: contentData.poster,
      releaseDate: contentData.releaseDate,
      tmdbId: contentData.tmdbId,
      seasonNumber: seasonNumber || null,
      episodeNumber: episodeNumber || null,
    }

    addToQueue(queueData)
  }

  const handleAddNextEpisode = () => {
    if (!item || !isTV) return

    const nextEpisodeData = {
      contentId: item.id,
      title: item.title,
      poster: item.poster,
      tmdbId: item.tmdbId,
      currentSeason: item.currentSeason || 1,
      currentEpisode: item.currentEpisode || 0,
      totalSeasons: item.totalSeasons,
      totalEpisodes: item.totalEpisodes,
    }

    addNextEpisode(nextEpisodeData)
  }

  // For TV shows with dropdown options
  if (isTV && showDropdown && item) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled || isLoading}
            className={className}
          >
            {isLoading ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ListPlus className="h-4 w-4 mr-2" />
            )}
            Add to Queue
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Add to Queue</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Add entire show */}
          <DropdownMenuItem onClick={handleAddToQueue} disabled={inQueue}>
            <ListPlus className="mr-2 h-4 w-4" />
            {inQueue ? `In queue (#${queuePosition})` : 'Entire show'}
          </DropdownMenuItem>

          {/* Add next episode */}
          {item.currentEpisode !== null && item.currentSeason !== null && (
            <DropdownMenuItem onClick={handleAddNextEpisode}>
              <ListPlus className="mr-2 h-4 w-4" />
              Next episode
              <span className="ml-2 text-xs text-muted-foreground">
                S
                {(
                  item.currentSeason +
                  (item.currentEpisode >= (item.totalEpisodes || 50) ? 1 : 0)
                )
                  .toString()
                  .padStart(2, '0')}
                E
                {(item.currentEpisode >= (item.totalEpisodes || 50)
                  ? 1
                  : item.currentEpisode + 1
                )
                  .toString()
                  .padStart(2, '0')}
              </span>
            </DropdownMenuItem>
          )}

          {/* Add specific episode (if season/episode provided) */}
          {seasonNumber && episodeNumber && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAddToQueue} disabled={inQueue}>
                <ListPlus className="mr-2 h-4 w-4" />
                {inQueue
                  ? `Episode in queue (#${queuePosition})`
                  : `S${seasonNumber.toString().padStart(2, '0')}E${episodeNumber.toString().padStart(2, '0')}`}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Simple button for movies or single actions
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading || inQueue}
      className={className}
      onClick={handleAddToQueue}
    >
      {isLoading ? (
        <Clock className="h-4 w-4 mr-2 animate-spin" />
      ) : inQueue ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <ListPlus className="h-4 w-4 mr-2" />
      )}
      {inQueue ? `In Queue (#${queuePosition})` : 'Add to Queue'}
    </Button>
  )
}

// Helper function to convert TMDB item to WatchedItem format
function convertTMDBToWatchedItem(
  tmdbItem: TVWithMediaType | MovieWithMediaType
): WatchedItem {
  return {
    id: `tmdb-${tmdbItem.id}`,
    tmdbId: tmdbItem.id,
    mediaType: tmdbItem.media_type === 'movie' ? 'MOVIE' : 'TV',
    title: tmdbItem.media_type === 'movie' ? tmdbItem.title : tmdbItem.name,
    poster: tmdbItem.poster_path || null,
    releaseDate:
      tmdbItem.media_type === 'movie'
        ? tmdbItem.release_date
          ? new Date(tmdbItem.release_date)
          : null
        : tmdbItem.first_air_date
          ? new Date(tmdbItem.first_air_date)
          : null,
    status: 'PLANNED',
    rating: null,
    currentEpisode: null,
    totalEpisodes: null,
    currentSeason: null,
    totalSeasons: null,
    currentRuntime: null,
    totalRuntime: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: null,
    finishDate: null,
    notes: [],
    _count: { notes: 0 },
    progress: 0,
  }
}
