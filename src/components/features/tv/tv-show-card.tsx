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
  Tv,
  ChevronRight,
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { MediaPoster } from '@/components/ui/media-poster'
import Link from 'next/link'
import {
  StatusBadge,
  MediaTypeBadge,
  RatingBadge,
  NotesBadge,
} from '@/components/ui/media-badges'
import type { WatchedItem, WatchStatus, WatchedItemCardProps } from '@/types'

const statusConfig = {
  PLANNED: { label: 'Planned', icon: Clock },
  WATCHING: { label: 'Watching', icon: Play },
  COMPLETED: { label: 'Completed', icon: Check },
  PAUSED: { label: 'Paused', icon: Pause },
  DROPPED: { label: 'Dropped', icon: X },
}

interface TVShowCardProps extends WatchedItemCardProps {
  showSeasonProgress?: boolean
}

export function TVShowCard({
  item,
  onUpdate,
  onDelete,
  showSeasonProgress = true,
}: TVShowCardProps) {
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [isEditingProgress, setIsEditingProgress] = useState(false)
  const [newSeason, setNewSeason] = useState(item.currentSeason || 1)
  const [newEpisode, setNewEpisode] = useState(item.currentEpisode || 1)

  const handleStatusChange = (newStatus: WatchStatus) => {
    onUpdate(item.id, {
      status: newStatus,
      ...(newStatus === 'COMPLETED' && { finishDate: new Date() }),
      ...(newStatus === 'WATCHING' &&
        !item.startDate && { startDate: new Date() }),
    })
  }

  const handleRatingChange = (rating: number | null) => {
    onUpdate(item.id, { rating })
    setIsEditingRating(false)
  }

  const handleProgressUpdate = () => {
    onUpdate(item.id, {
      currentSeason: newSeason,
      currentEpisode: newEpisode,
    })
    setIsEditingProgress(false)
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

  // Calculate season progress
  const getSeasonProgress = () => {
    if (!item.totalSeasons || !item.currentSeason) return 0
    return Math.min((item.currentSeason / item.totalSeasons) * 100, 100)
  }

  const nextEpisode = item.currentSeason && item.currentEpisode 
    ? `S${item.currentSeason}E${item.currentEpisode + 1}`
    : 'S1E1'

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
                    onClick={() => setIsEditingProgress(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Update Progress
                  </DropdownMenuItem>
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
                <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                  <div className="text-center">
                    <div className="font-medium">
                      {item.currentSeason || 0}/{item.totalSeasons || '?'}
                    </div>
                    <div className="text-muted-foreground">Seasons</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {item.currentEpisode || 0}
                    </div>
                    <div className="text-muted-foreground">Episode</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-primary">
                      {nextEpisode}
                    </div>
                    <div className="text-muted-foreground">Up Next</div>
                  </div>
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
      <Dialog open={isEditingProgress} onOpenChange={setIsEditingProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              Set your current season and episode progress for {item.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                type="number"
                min="1"
                max={item.totalSeasons || undefined}
                value={newSeason}
                onChange={(e) => setNewSeason(parseInt(e.target.value) || 1)}
              />
              {item.totalSeasons && (
                <p className="text-xs text-muted-foreground">
                  Total: {item.totalSeasons} seasons
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="episode">Episode</Label>
              <Input
                id="episode"
                type="number"
                min="1"
                value={newEpisode}
                onChange={(e) => setNewEpisode(parseInt(e.target.value) || 1)}
              />
              {item.totalEpisodes && (
                <p className="text-xs text-muted-foreground">
                  Total: {item.totalEpisodes} episodes
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditingProgress(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleProgressUpdate}>
              Update Progress
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}