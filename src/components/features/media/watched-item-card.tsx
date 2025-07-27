'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Star,
  Clock,
  Play,
  Pause,
  Check,
  X,
  Edit3,
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
import Link from 'next/link'
import {
  StatusBadge,
  MediaTypeBadge,
  RatingBadge,
  NotesBadge,
  ReleaseDate,
} from '@/components/ui/media-badges'
import { ProgressDisplay } from '@/components/ui/progress-display'
import type { WatchedItem, WatchStatus, WatchedItemCardProps } from '@/types'

const statusConfig = {
  PLANNED: { label: 'Planned', icon: Clock },
  WATCHING: { label: 'Watching', icon: Play },
  COMPLETED: { label: 'Completed', icon: Check },
  PAUSED: { label: 'Paused', icon: Pause },
  DROPPED: { label: 'Dropped', icon: X },
}

export function WatchedItemCard({
  item,
  onUpdate,
  onDelete,
}: WatchedItemCardProps) {
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false)

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
    onUpdate(item.id, {
      status: 'PLANNED',
      progress: 0,
      currentSeason: 1,
      currentEpisode: 1,
      startDate: null,
      finishDate: null,
      // Reset all episodes to unwatched - this will be handled by the backend
    })
  }

  const detailUrl = item.mediaType === 'MOVIE' 
    ? `/movie/${item.tmdbId}`
    : `/tv/${item.tmdbId}`

  return (
    <Card className="group transition-shadow hover:shadow-md p-0">
      <CardContent className="p-4">
        <div className="flex gap-4">
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
                    icon={statusConfig[item.status].icon}
                  />

                  {/* <ReleaseDate date={item.releaseDate} /> */}
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
                  {Object.entries(statusConfig).map(([status, config]) => (
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

            <div className="flex items-center gap-2 mt-3">
              {item.rating ? (
                <RatingBadge
                  rating={item.rating}
                  onClick={() => setIsEditingRating(true)}
                  interactive
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingRating(true)}
                  className="text-muted-foreground"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Rate
                </Button>
              )}
              <NotesBadge count={item._count.notes} />
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
      <AlertDialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Show as Complete?</AlertDialogTitle>
            <AlertDialogDescription>
              Marking "{item.title}" as complete will automatically mark all seasons and episodes as watched. This action will update your overall progress to 100%. Are you sure you want to continue?
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
    </Card>
  )
}
