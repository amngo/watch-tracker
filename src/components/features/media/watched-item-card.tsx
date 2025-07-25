'use client'

import { useState } from 'react'
import { MoreHorizontal, Star, Clock, Play, Pause, Check, X, Edit3, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/trpc/react'

type WatchStatus = 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'PAUSED' | 'DROPPED'
type MediaType = 'MOVIE' | 'TV'

interface WatchedItem {
  id: string
  tmdbId: number
  mediaType: MediaType
  title: string
  poster: string | null
  releaseDate: Date | null
  status: WatchStatus
  rating: number | null
  startDate: Date | null
  finishDate: Date | null
  currentSeason: number | null
  currentEpisode: number | null
  totalSeasons: number | null
  totalEpisodes: number | null
  currentRuntime: number | null
  totalRuntime: number | null
  notes: { id: string; content: string; timestamp: string | null; createdAt: Date; isPublic: boolean; hasSpoilers: boolean; updatedAt: Date; userId: string; watchedItemId: string }[]
  _count: { notes: number }
}

interface WatchedItemCardProps {
  item: WatchedItem
  onUpdate: (id: string, data: Partial<WatchedItem>) => void
  onDelete: (id: string) => void
}

const statusConfig = {
  PLANNED: { label: 'Planned', color: 'bg-slate-500', icon: Clock },
  WATCHING: { label: 'Watching', color: 'bg-blue-500', icon: Play },
  COMPLETED: { label: 'Completed', color: 'bg-green-500', icon: Check },
  PAUSED: { label: 'Paused', color: 'bg-yellow-500', icon: Pause },
  DROPPED: { label: 'Dropped', color: 'bg-red-500', icon: X }
}

export function WatchedItemCard({ item, onUpdate, onDelete }: WatchedItemCardProps) {
  const [isEditingProgress, setIsEditingProgress] = useState(false)
  const [isEditingRating, setIsEditingRating] = useState(false)
  
  const StatusIcon = statusConfig[item.status].icon

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (item.status === 'COMPLETED') return 100
    if (item.status === 'PLANNED') return 0
    
    if (item.mediaType === 'TV' && item.totalEpisodes && item.currentEpisode) {
      return Math.round((item.currentEpisode / item.totalEpisodes) * 100)
    }
    
    if (item.mediaType === 'MOVIE' && item.totalRuntime && item.currentRuntime) {
      return Math.round((item.currentRuntime / item.totalRuntime) * 100)
    }
    
    return 0
  }

  const getProgressText = () => {
    if (item.mediaType === 'TV') {
      if (item.currentSeason && item.currentEpisode) {
        return `S${item.currentSeason}E${item.currentEpisode}`
      }
      if (item.currentEpisode && item.totalEpisodes) {
        return `${item.currentEpisode}/${item.totalEpisodes} episodes`
      }
    }
    
    if (item.mediaType === 'MOVIE' && item.currentRuntime && item.totalRuntime) {
      const current = Math.floor(item.currentRuntime)
      const total = Math.floor(item.totalRuntime)
      return `${current}/${total} minutes`
    }
    
    return item.status === 'COMPLETED' ? 'Completed' : 'Not started'
  }

  const handleStatusChange = (newStatus: WatchStatus) => {
    onUpdate(item.id, { 
      status: newStatus,
      ...(newStatus === 'COMPLETED' && { finishDate: new Date() }),
      ...(newStatus === 'WATCHING' && !item.startDate && { startDate: new Date() })
    })
  }

  const handleRatingChange = (rating: number) => {
    onUpdate(item.id, { rating })
    setIsEditingRating(false)
  }

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="relative h-32 w-20 rounded bg-muted flex items-center justify-center shrink-0">
            {item.poster ? (
              <img
                src={`https://image.tmdb.org/t/p/w154${item.poster}`}
                alt={item.title}
                className="h-full w-full object-cover rounded"
              />
            ) : (
              <div className="text-muted-foreground text-xs text-center p-1">
                No Image
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    className={`${statusConfig[item.status].color} text-white`}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[item.status].label}
                  </Badge>
                  
                  <Badge variant="outline">
                    {item.mediaType === 'MOVIE' ? 'Movie' : 'TV Show'}
                  </Badge>
                  
                  {item.releaseDate && (
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.releaseDate).getFullYear()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <DropdownMenuItem onClick={() => setIsEditingProgress(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Progress */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {getProgressText()}
                </span>
                <span className="text-sm font-medium">
                  {getProgressPercentage()}%
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Rating and Notes */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {/* Rating */}
                {item.rating ? (
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setIsEditingRating(true)}>
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {item.rating}/10
                  </Badge>
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

                {/* Notes Count */}
                {item._count.notes > 0 && (
                  <Badge variant="outline">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {item._count.notes} notes
                  </Badge>
                )}
              </div>
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
                  variant={item.rating && item.rating > i ? "default" : "outline"}
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