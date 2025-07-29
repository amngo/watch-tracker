'use client'

import { useState, memo } from 'react'
import {
  MoreHorizontal,
  Edit3,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { MediaPoster } from '@/components/ui/media-poster'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import {
  StatusBadge,
  MediaTypeBadge,
  RatingBadge,
  NotesBadge,
} from '@/components/ui/media-badges'
import type { WatchStatus, WatchedItemCardProps } from '@/types'
import { useMedia } from '@/hooks/use-media'
import { useStatusActions } from '@/hooks/use-status-actions'
import { STATUS_CONFIG } from '@/lib/constants/status'
import { ProgressUpdateDialog } from './progress-update-dialog'
import { cn } from '@/lib/utils'

interface TVShowCardProps extends WatchedItemCardProps {
  showSeasonProgress?: boolean
  showRefreshButton?: boolean
  // Selection props
  isSelected?: boolean
  onSelectionChange?: (id: string, selected: boolean) => void
  showSelection?: boolean
}

function TVShowCardComponent({
  item,
  onUpdate,
  onDelete,
  showSeasonProgress = true,
  showRefreshButton = true,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
}: TVShowCardProps) {
  const [isEditingProgress, setIsEditingProgress] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const { updateTVShowDetails } = useMedia()
  const {
    handleStatusChange,
    handleConfirmComplete,
    handleResetProgress: handleStatusReset,
    isCompletionDialogOpen,
    setIsCompletionDialogOpen,
  } = useStatusActions(item, {
    onUpdate,
    requiresConfirmation: true,
  })


  const handleProgressUpdate = (season: number, episode: number) => {
    onUpdate(item.id, {
      currentSeason: season,
      currentEpisode: episode,
    })
  }

  const handleRefreshDetails = () => {
    updateTVShowDetails(item.id)
  }

  const handleResetProgress = () => {
    setIsResetDialogOpen(true)
  }

  const handleConfirmReset = () => {
    handleStatusReset()
    setIsResetDialogOpen(false)
  }

  const detailUrl = `/tv/${item.tmdbId}`

  // Calculate progress text for TV shows
  const getProgressText = () => {
    if (item.status === 'COMPLETED') return 'Completed'
    if (item.status === 'PLANNED') return 'Not started'

    if (item.currentSeason && item.currentEpisode) {
      return `S${item.currentSeason}E${item.currentEpisode}`
    }

    if (item.currentEpisode && item.totalEpisodes) {
      return `${item.currentEpisode}/${item.totalEpisodes} episodes`
    }

    return 'In progress'
  }


  const nextEpisode =
    item.currentSeason && item.currentEpisode
      ? `S${item.currentSeason}E${item.currentEpisode + 1}`
      : 'S1E1'

  return (
    <Card className={cn(
      "group transition-all hover:shadow-md p-0",
      isSelected && "ring-2 ring-primary bg-primary/5"
    )}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Selection checkbox */}
          {showSelection && onSelectionChange && (
            <div className="flex-shrink-0 self-start pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => 
                  onSelectionChange(item.id, Boolean(checked))
                }
                aria-label={`Select ${item.title}`}
              />
            </div>
          )}

          <Link href={detailUrl} className="flex-shrink-0">
            <MediaPoster
              src={item.poster}
              alt={item.title}
              mediaType={item.mediaType}
              size="md"
            />
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link href={detailUrl} className="block">
                  <h3 className="font-semibold text-sm leading-tight truncate hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mt-2">
                  <MediaTypeBadge mediaType={item.mediaType} />
                  <StatusBadge
                    status={item.status}
                    icon={STATUS_CONFIG[item.status].icon}
                  />
                  {item.rating && <RatingBadge rating={item.rating} />}
                  {item._count?.notes > 0 && (
                    <NotesBadge count={item._count.notes} />
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status as WatchStatus)}
                      className="flex items-center gap-2"
                    >
                      <config.icon className="h-4 w-4" />
                      Mark as {config.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsEditingProgress(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Update Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleResetProgress}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Progress
                  </DropdownMenuItem>
                  {showRefreshButton && item.mediaType === 'TV' && (
                    <DropdownMenuItem
                      onClick={handleRefreshDetails}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Details
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(item.id)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* TV Show Specific Progress */}
            <div className="mt-3 space-y-2">
              {/* Episode Progress */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {getProgressText()}
                </span>
                <span className="font-medium">{item.progress}%</span>
              </div>
              <Progress value={item.progress} className="h-1.5" />

              {/* Season and Episode Details for TV Shows */}
              {showSeasonProgress && item.mediaType === 'TV' && (
                <div className="pt-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium">
                        {item.totalSeasons || '?'}
                      </div>
                      <div className="text-muted-foreground">Seasons</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">
                        {item.totalEpisodes || '?'}
                      </div>
                      <div className="text-muted-foreground">Episodes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-primary">
                        {nextEpisode}
                      </div>
                      <div className="text-muted-foreground">Up Next</div>
                    </div>
                  </div>

                  {/* Show refresh button if season/episode data is missing */}
                  {showRefreshButton &&
                    (!item.totalSeasons || !item.totalEpisodes) && (
                      <div className="flex justify-center mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRefreshDetails}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Get Season/Episode Info
                        </Button>
                      </div>
                    )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingProgress(true)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Update Progress
                </Button>
                <Link href={detailUrl}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs px-2 py-1 h-auto"
                  >
                    View Seasons
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Progress Update Dialog */}
      <ProgressUpdateDialog
        isOpen={isEditingProgress}
        onOpenChange={setIsEditingProgress}
        item={item}
        onUpdate={handleProgressUpdate}
      />

      {/* Completion Confirmation Dialog */}
      <AlertDialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Show as Complete?</AlertDialogTitle>
            <AlertDialogDescription>
              Marking &quot;{item.title}&quot; as complete will automatically mark all seasons and episodes as watched. This action will update your overall progress to 100%. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmComplete}>
              Yes, Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Progress Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Show Progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset &quot;{item.title}&quot; back to planned status and mark all episodes as unwatched. Your progress will be set to 0% and all episode tracking will be cleared. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export const TVShowCard = memo(TVShowCardComponent)
