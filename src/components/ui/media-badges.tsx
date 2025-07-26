import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare } from 'lucide-react'
import type { WatchStatus } from '@/types'

interface StatusBadgeProps {
  status: WatchStatus
  icon?: React.ComponentType<{ className?: string }>
}

interface MediaTypeBadgeProps {
  mediaType: 'MOVIE' | 'TV' | 'movie' | 'tv' | 'person'
}

interface RatingBadgeProps {
  rating?: number | null
  onClick?: () => void
  interactive?: boolean
}

interface NotesBadgeProps {
  count: number
}

interface ReleaseDateProps {
  date?: Date | string | null
}

const statusConfig = {
  PLANNED: { label: 'Planned', variant: 'secondary' as const },
  WATCHING: { label: 'Watching', variant: 'default' as const },
  COMPLETED: { label: 'Completed', variant: 'default' as const },
  PAUSED: { label: 'Paused', variant: 'secondary' as const },
  DROPPED: { label: 'Dropped', variant: 'destructive' as const },
}

export function StatusBadge({ status, icon: Icon }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

export function MediaTypeBadge({ mediaType }: MediaTypeBadgeProps) {
  if (mediaType === 'person') return null

  const isMovie = mediaType === 'MOVIE' || mediaType === 'movie'

  return (
    <Badge variant={isMovie ? 'default' : 'secondary'}>
      {isMovie ? 'Movie' : 'TV Show'}
    </Badge>
  )
}

export function RatingBadge({
  rating,
  onClick,
  interactive = false,
}: RatingBadgeProps) {
  if (!rating) return null

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 ${interactive ? 'cursor-pointer hover:bg-accent' : ''}`}
      onClick={onClick}
    >
      <Star className="h-3 w-3 fill-current" />
      {rating}/10
    </Badge>
  )
}

export function NotesBadge({ count }: NotesBadgeProps) {
  if (count === 0) return null

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <MessageSquare className="h-3 w-3" />
      {count} {count === 1 ? 'note' : 'notes'}
    </Badge>
  )
}

export function ReleaseDate({ date }: ReleaseDateProps) {
  if (!date) return null

  const year = new Date(date).getFullYear()

  return <span className="text-sm text-muted-foreground">{year}</span>
}

export function VoteAverageBadge({ rating }: { rating: number }) {
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      ⭐ {rating.toFixed(1)}
    </Badge>
  )
}
