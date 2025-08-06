'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Clock,
  Play,
  Pause,
  Check,
  X,
  RotateCcw,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { MediaPoster } from '@/components/ui/media-poster'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { StatusBadge, MediaTypeBadge } from '@/components/ui/media-badges'
import { ProgressDisplay } from '@/components/ui/progress-display'
import { AddToQueueButton } from '@/components/features/queue/add-to-queue-button'
import type { WatchStatus, WatchedItemCardProps } from '@/types'
import { cn } from '@/lib/utils'

const statusConfig = {
  PLANNED: { label: 'Planned', icon: Clock },
  WATCHING: { label: 'Watching', icon: Play },
  COMPLETED: { label: 'Completed', icon: Check },
  PAUSED: { label: 'Paused', icon: Pause },
  DROPPED: { label: 'Dropped', icon: X },
}

interface ExtendedWatchedItemCardProps extends WatchedItemCardProps {
  // Selection props
  isSelected?: boolean
  onSelectionChange?: (id: string, selected: boolean) => void
  showSelection?: boolean
}

export function WatchedItemCard({
  item,
  onUpdate,
  onDelete,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
}: ExtendedWatchedItemCardProps) {
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const handleStatusChange = (newStatus: WatchStatus) => {
    // Show confirmation dialog for TV shows when marking as complete
    if (newStatus === 'COMPLETED' && item.mediaType === 'TV') {
      setIsCompletionDialogOpen(true)
      return
    }

    onUpdate(item.id, {
      status: newStatus,
      ...(newStatus === 'COMPLETED' && { finishDate: new Date() }),
      ...(newStatus === 'WATCHING' &&
        !item.startDate && { startDate: new Date() }),
    })
  }

  const handleConfirmComplete = () => {
    onUpdate(item.id, {
      status: 'COMPLETED',
      progress: 100,
      finishDate: new Date(),
      // Mark all episodes as watched - this will be handled by the backend
    })
    setIsCompletionDialogOpen(false)
  }

  const handleRatingChange = (rating: number | null) => {
    onUpdate(item.id, { rating })
    setIsEditingRating(false)
  }

  const handleResetProgress = () => {
    setIsResetDialogOpen(true)
  }

  const handleConfirmReset = () => {
    onUpdate(item.id, {
      status: 'PLANNED',
      progress: 0,
      currentSeason: 1,
      currentEpisode: 1,
      startDate: null,
      finishDate: null,
      // Reset all episodes to unwatched by providing empty array
      watchedEpisodes: [],
    })
    setIsResetDialogOpen(false)
  }

  const detailUrl =
    item.mediaType === 'MOVIE' ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`

  const handleCardClick = (e: React.MouseEvent) => {
    if (showSelection && onSelectionChange) {
      // Prevent propagation if clicked on interactive elements during selection mode
      e.preventDefault()
      e.stopPropagation()
      onSelectionChange(item.id, !isSelected)
    }
  }

  return (
    <Card
      className={cn(
        'group transition-all hover:shadow-md p-0',
        isSelected && 'ring-2 ring-primary bg-primary/5',
        showSelection && 'cursor-pointer select-none'
      )}
      onClick={showSelection ? handleCardClick : undefined}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Selection checkbox */}
          {showSelection && onSelectionChange && (
            <div
              className="flex-shrink-0 self-start pt-1 z-10"
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={checked =>
                  onSelectionChange(item.id, Boolean(checked))
                }
                aria-label={`Select ${item.title}`}
              />
            </div>
          )}

          {showSelection ? (
            <div className="pointer-events-none">
              <MediaPoster
                src={item.poster}
                alt={item.title}
                mediaType={item.mediaType}
                size="lg"
              />
            </div>
          ) : (
            <Link href={detailUrl}>
              <MediaPoster
                src={item.poster}
                alt={item.title}
                mediaType={item.mediaType}
                size="lg"
              />
            </Link>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {showSelection ? (
                  <h3 className="font-semibold text-sm leading-tight truncate pointer-events-none">
                    {item.title}
                  </h3>
                ) : (
                  <Link href={detailUrl} className="block">
                    <h3 className="font-semibold text-sm leading-tight truncate hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <MediaTypeBadge mediaType={item.mediaType} />
                  <StatusBadge
                    status={item.status}
                    icon={statusConfig[item.status].icon}
                  />
                </div>
              </div>

              {/* Actions Menu - Hidden during selection mode */}
              {!showSelection && (
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
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() =>
                          handleStatusChange(status as WatchStatus)
                        }
                        className="flex items-center gap-2"
                      >
                        <config.icon className="h-4 w-4" />
                        Mark as {config.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    {item.mediaType === 'TV' && (
                      <DropdownMenuItem
                        onClick={handleResetProgress}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset Progress
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(item.id)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <ProgressDisplay
              status={item.status}
              mediaType={item.mediaType}
              currentEpisode={item.currentEpisode}
              totalEpisodes={item.totalEpisodes}
              currentSeason={item.currentSeason}
              currentRuntime={item.currentRuntime}
              totalRuntime={item.totalRuntime}
              className="mt-2"
            />

            <div className="flex items-center justify-between mt-3">
              {!showSelection && (
                <AddToQueueButton
                  item={item}
                  showDropdown={item.mediaType === 'TV'}
                  size="sm"
                  variant="outline"
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Rating Dialog */}
      <Dialog open={isEditingRating} onOpenChange={setIsEditingRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {item.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <Button
                  key={i}
                  variant={
                    item.rating && item.rating > i ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleRatingChange(i + 1)}
                  className="w-10 h-10 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            {item.rating && (
              <Button
                variant="outline"
                onClick={() => handleRatingChange(null)}
              >
                Remove Rating
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Confirmation Dialog */}
      <AlertDialog
        open={isCompletionDialogOpen}
        onOpenChange={setIsCompletionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Show as Complete?</AlertDialogTitle>
            <AlertDialogDescription>
              Marking &quot;{item.title}&quot; as complete will automatically
              mark all seasons and episodes as watched. This action will update
              your overall progress to 100%. Are you sure you want to continue?
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
              This will reset &quot;{item.title}&quot; back to planned status
              and mark all episodes as unwatched. Your progress will be set to
              0% and all episode tracking will be cleared. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
