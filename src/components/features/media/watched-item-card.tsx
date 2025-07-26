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
import { MediaPoster } from '@/components/ui/media-poster'
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

  const handleStatusChange = (newStatus: WatchStatus) => {
    onUpdate(item.id, {
      status: newStatus,
      ...(newStatus === 'COMPLETED' && { finishDate: new Date() }),
      ...(newStatus === 'WATCHING' &&
        !item.startDate && { startDate: new Date() }),
    })
  }

  const handleRatingChange = (rating: number) => {
    onUpdate(item.id, { rating })
    setIsEditingRating(false)
  }

  return (
    <Card className="group transition-shadow hover:shadow-md p-0">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <MediaPoster
            src={item.poster}
            alt={item.title}
            mediaType={item.mediaType}
            size="md"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {item.title}
                </h3>

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
              <Button variant="outline" onClick={() => handleRatingChange(0)}>
                Remove Rating
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
