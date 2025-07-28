import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare } from 'lucide-react'
import type { WatchStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/constants/status'

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

const STATUS_VARIANTS = {
  PLANNED: 'secondary' as const,
  WATCHING: 'default' as const,
  COMPLETED: 'default' as const,
  PAUSED: 'secondary' as const,
  DROPPED: 'destructive' as const,
} satisfies Record<WatchStatus, 'default' | 'secondary' | 'destructive' | 'outline'>

export function StatusBadge({ status, icon: Icon }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className="flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {STATUS_LABELS[status]}
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
