'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Trash2,
  Play,
  Check,
  Calendar,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
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
import { MediaPoster } from '@/components/ui/media-poster'
import { MediaTypeBadge } from '@/components/ui/media-badges'
import type { QueueItem } from '@/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface SimpleQueueItemProps {
  item: QueueItem
  onRemove: (id: string) => void
  onMarkWatched: (id: string) => void
  onMoveUp?: (id: string) => void
  onMoveDown?: (id: string) => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  // Selection props
  isSelected?: boolean
  onSelectionChange?: (id: string, selected: boolean) => void
  showSelection?: boolean
}

export function SimpleQueueItem({
  item,
  onRemove,
  onMarkWatched,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
}: SimpleQueueItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleRemove = () => {
    onRemove(item.id)
    setShowDeleteDialog(false)
  }

  const getDisplayTitle = () => {
    if (item.contentType === 'TV' && item.seasonNumber && item.episodeNumber) {
      const episodeCode = `S${item.seasonNumber.toString().padStart(2, '0')}E${item.episodeNumber.toString().padStart(2, '0')}`
      if (item.episodeName) {
        return `${item.title} - ${episodeCode}: ${item.episodeName}`
      }
      return `${item.title} - ${episodeCode}`
    }
    return item.title
  }

  const getSubtitle = () => {
    if (item.contentType === 'TV' && item.seasonNumber && item.episodeNumber) {
      if (item.episodeName) {
        return `Season ${item.seasonNumber}, Episode ${item.episodeNumber}`
      }
      return `Season ${item.seasonNumber}, Episode ${item.episodeNumber}`
    }
    if (item.releaseDate) {
      return format(new Date(item.releaseDate), 'yyyy')
    }
    return null
  }

  return (
    <Card
      className={cn(
        'transition-all p-0', 
        item.watched && 'opacity-60',
        isSelected && 'ring-2 ring-primary bg-primary/5'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Selection checkbox */}
          {showSelection && onSelectionChange && (
            <div className="flex-shrink-0">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => 
                  onSelectionChange(item.id, Boolean(checked))
                }
                aria-label={`Select ${getDisplayTitle()}`}
              />
            </div>
          )}

          {/* Position and reorder controls */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium">
              {item.position}
            </div>
            {(onMoveUp || onMoveDown) && (
              <div className="flex flex-col gap-1">
                {onMoveUp && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => onMoveUp(item.id)}
                    disabled={!canMoveUp}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                )}
                {onMoveDown && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => onMoveDown(item.id)}
                    disabled={!canMoveDown}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Poster */}
          <div className="flex-shrink-0">
            <MediaPoster
              src={item.poster}
              alt={item.title}
              className="w-12 h-16 rounded"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight truncate">
                  {getDisplayTitle()}
                </h3>
                {getSubtitle() && (
                  <p className="text-muted-foreground text-xs mt-1">
                    {getSubtitle()}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <MediaTypeBadge mediaType={item.contentType} />
                  {item.watched && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <Check className="h-3 w-3" />
                      Watched
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                {!item.watched && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkWatched(item.id)}
                    className="h-8 px-3"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Watch
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!item.watched && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onMarkWatched(item.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark as Watched
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove from Queue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Added date */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Added {format(new Date(item.addedAt), 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Queue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{getDisplayTitle()}&rdquo;
              from your queue? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
